interface TemperatureSliderProps {
  temperature: number;
  onChange: (value: number) => void;
}

export default function TemperatureSlider({
  temperature,
  onChange,
}: TemperatureSliderProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium">
          Creativity: {temperature.toFixed(2)}
        </label>
      </div>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={temperature}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-purple-500"
      />
    </div>
  );
}
