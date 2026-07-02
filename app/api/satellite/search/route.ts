import { NextResponse } from 'next/server';
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    let { bbox, startDate, endDate, maxCloudCover = 20, talhaoId, saveToDb = false } = body;

    // Se passou talhaoId e não passou bbox, tenta pegar do banco
    let dbTalhao = null;
    if (talhaoId && (!bbox || bbox.length !== 4)) {
      const { data, error } = await supabase.from('talhoes').select('bbox_geojson, latitude, longitude, fazenda_id').eq('id', talhaoId).single();
      if (data && data.bbox_geojson) {
        dbTalhao = data;
        // turf/bbox array format [minX, minY, maxX, maxY]
        // Se bbox_geojson for um polygon, teríamos que calcular. Mas vamos assumir que a API antiga exigia bbox.
        // A API STAC (Earth Search) aceita 'intersects' (GeoJSON) ao invés de bbox para polygons complexos.
        // Vamos usar intersects se houver dbTalhao.bbox_geojson
      }
    }

    if (!bbox && !dbTalhao) {
      return NextResponse.json({ error: 'É necessário fornecer bbox ou um talhaoId válido com geometria.' }, { status: 400 });
    }

    // Default to last 30 days if no dates provided
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date();
    if (!startDate) {
      start.setDate(start.getDate() - 30);
    }
    
    // Format to ISO strings for STAC API
    const datetime = `${start.toISOString()}/${end.toISOString()}`;

    // STAC API Query Payload for Element 84 Earth Search (v1)
    const payload: any = {
      collections: ["sentinel-2-l2a"],
      datetime: datetime,
      query: {
        "eo:cloud_cover": {
          "lt": maxCloudCover
        }
      },
      limit: 15,
      sortby: [
        {
          "field": "properties.datetime",
          "direction": "desc"
        }
      ]
    };

    if (dbTalhao?.bbox_geojson) {
      // Element 84 API (STAC) expects a GeoJSON Geometry for 'intersects', not a Feature.
      if (dbTalhao.bbox_geojson.type === 'Feature') {
        payload.intersects = dbTalhao.bbox_geojson.geometry;
      } else {
        payload.intersects = dbTalhao.bbox_geojson;
      }
    } else {
      payload.bbox = bbox;
    }

    console.log("Consultando Element 84 API (Sentinel-2):", JSON.stringify(payload));

    const stacRes = await fetch("https://earth-search.aws.element84.com/v1/search", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!stacRes.ok) {
      const errorText = await stacRes.text();
      console.error("STAC API Error:", stacRes.status, errorText);
      return NextResponse.json({ error: 'Erro ao buscar dados na STAC API.' }, { status: stacRes.status });
    }

    const data = await stacRes.json();

    // Map to a cleaner frontend format
    const scenes = (data.features || []).map((feature: any) => {
      const visualUrl = feature.assets?.visual?.href;
      // TiTiler STAC endpoint to process the STAC Item on the fly
      const stacItemUrl = feature.links.find((l: any) => l.rel === 'self')?.href || `https://earth-search.aws.element84.com/v1/collections/sentinel-2-l2a/items/${feature.id}`;
      
      const titilerStacBase = "https://titiler.xyz/stac/tiles/WebMercatorQuad/{z}/{x}/{y}";
      
      const ortoUrl = `${titilerStacBase}?url=${encodeURIComponent(stacItemUrl)}&assets=visual`;
      const ndviUrl = `${titilerStacBase}?url=${encodeURIComponent(stacItemUrl)}&expression=(nir-red)/(nir%2Bred)&rescale=-1,1&colormap_name=rdylgn`;
      const variUrl = `${titilerStacBase}?url=${encodeURIComponent(stacItemUrl)}&expression=(green-red)/(green%2Bred-blue)&rescale=-1,1&colormap_name=rdylgn`;
      const falsaCorUrl = `${titilerStacBase}?url=${encodeURIComponent(stacItemUrl)}&assets=nir,red,green&color_formula=Gamma+RGB+3.2+Saturation+1.5+Sigmoidal+RGB+25+0.35`;

      return {
        id: feature.id,
        datetime: feature.properties.datetime,
        cloudCover: feature.properties['eo:cloud_cover'],
        stacItemUrl,
        thumbnail: feature.assets?.thumbnail?.href || null,
        visualUrl,
        ortomosaicoUrl: ortoUrl,
        ndviUrl,
        variUrl,
        falsaCorUrl
      };
    });

    // Se solicitado, salva a melhor imagem no banco (a mais recente sem nuvens já veio primeiro pelo sort)
    let savedProject = null;
    if (saveToDb && scenes.length > 0 && talhaoId) {
      const bestScene = scenes[0];
      
      const { data: projeto, error: errorInsert } = await supabase.from("projetos").insert({
        talhao_id: talhaoId,
        fazenda_id: dbTalhao?.fazenda_id || null,
        codigo: bestScene.id,
        data_voo: bestScene.datetime,
        fonte_captura: "Satelite",
        status: "Concluído",
        latitude: dbTalhao?.latitude || null,
        longitude: dbTalhao?.longitude || null,
        ortomosaico_img_url: bestScene.ortomosaicoUrl,
        ndvi_img_url: bestScene.ndviUrl,
        vari_img_url: bestScene.variUrl,
        falsa_cor_img_url: bestScene.falsaCorUrl,
        alto_vigor: 100 - bestScene.cloudCover, // placeholder
        medio_vigor: bestScene.cloudCover,
        baixo_vigor: 0
      }).select().single();

      if (errorInsert) {
        console.error("Erro ao salvar projeto satélite:", errorInsert);
      } else {
        savedProject = projeto;
      }
    }

    return NextResponse.json({ scenes, rawFeatures: data.features, savedProject });

  } catch (error: any) {
    console.error('Erro na API de busca do satélite:', error);
    return NextResponse.json({ error: 'Erro interno no servidor', details: error.message }, { status: 500 });
  }
}
