const PRESETS = {
  savanna: {
    axiom: "X",
    rules: {
      X: [
        { weight: 1, value: "F+[[X]-X]-F[-FX]+X" },
        { weight: 1, value: "F[-X][X]+F[+FX]-X" },
      ],
      F: "FF",
      "+": "+",
      "-": "-",
      "[": "[",
      "]": "]",
    },
    iterations: 10,
    angle: 25,
    distance: 1e-1,
  },
  dummy: {
    axiom: "X",
    rules: {
      X: "F[+X]FX",
      F: "FF",
    },
    iterations: 5,
    angle: 12,
    distance: 5,
  },
  shrub: {
    axiom: "F",
    rules: { F: "FF+[+F-F-F]-[-F+F+F]" },
    iterations: 5,
    angle: 22.5,
    distance: 0.75,
  },
  windytree: {
    axiom: "X",
    rules: { X: "FFF+[+X-X-X]-[-X+X+X]F", F: "FF" },
    iterations: 5,
    angle: 22.5,
    distance: 1,
  },
  tree: {
    axiom: "X",
    rules: {
      X: [
        {
          weight: 0.25,
          value: "F[+XX][-XX][FX]X",
        },
        {
          weight: 0.25,
          value: "F[-XX][FX]X",
        },
        {
          weight: 0.25,
          value: "F[*XX][FX]X",
        },
        {
          weight: 0.25,
          value: "F[^XX][*XX][FX]X",
        },
        {
          weight: 0.25,
          value: "F[/XX][\\XX][FX]X",
        },
        {
          weight: 0.25,
          value: "F[\\XX][FX]X",
        },
      ],
      F: "FF",
      "+": "+",
      "-": "-",
      "[": "[",
      "]": "]",
      "*": "*",
      "^": "^",
      "\\": "\\",
      "/": "/",
    },
    iterations: 8,
    angle: 45,
    minAngle: 15,
    maxAngle: 50,
    distance: 1e-1,
  },
  snowflake: {
    axiom: "X",
    rules: {
      X: [
        {
          weight: 1,
          value: "[-FX][+FX]FX",
        },
      ],
      F: "FF",
    },
    iterations: 12,
    angle: 45,
    distance: 1e-2,
  },
};

export default PRESETS;
