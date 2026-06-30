interface Props {
  value: number;
}

export default function ProgressBar({
  value,
}: Props) {

  return (

    <div className="w-full bg-slate-700 rounded-full h-2">

      <div
        className="bg-green-500 h-2 rounded-full transition-all"
        style={{
          width: `${value}%`,
        }}
      />

    </div>

  );

}