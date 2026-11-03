const faces = [0, 1, 2, 3, 4, 5];

export default function Pencil({ className = "" }: { className?: string }) {
  return (
    <div className={`pencil ${className}`.trim()} aria-hidden="true">
      <div className="pencil-cap">
        {faces.map((face) => (
          <span
            className="pencil-cap-face"
            key={`cap-${face}`}
            style={{ transform: `rotateY(${face * 60}deg) translateZ(var(--apothem))` }}
          />
        ))}
        <span className="pencil-cap-core" />
        <span className="pencil-cap-endcap-top" />
      </div>

      <div className="pencil-body">
        <span className="pencil-body-core" />

        {faces.map((face) => (
          <span
            className="pencil-face"
            key={`body-${face}`}
            style={{ transform: `rotateY(${face * 60}deg) translateZ(var(--apothem))` }}
          />
        ))}

        <div className="pencil-band">
          {faces.map((face) => (
            <span
              className="pencil-band-face"
              key={`band-${face}`}
              style={{ transform: `rotateY(${face * 60}deg) translateZ(var(--apothem))` }}
            >
              {face === 0 && <span className="pencil-band-print">✦</span>}
            </span>
          ))}
        </div>
      </div>

      <div className="pencil-tip">
        <span className="pencil-tip-core" />
        <div className="pencil-shoulder">
          {faces.map((face) => (
            <span
              className="pencil-shoulder-face"
              key={`shoulder-${face}`}
              style={{ transform: `rotateY(${face * 60}deg) translateZ(var(--apothem))` }}
            />
          ))}
        </div>

        {faces.map((face) => (
          <span
            className="pencil-tip-face"
            key={`tip-${face}`}
            style={{
              transform: `rotateY(${face * 60}deg) translateZ(var(--apothem)) rotateX(var(--tip-tilt))`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
