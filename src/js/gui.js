var config = { rotate: degToRad(20) };

const loadGUI = () => {
  const gui = new dat.GUI();
  gui.add(config, "rotate", 0, 20, 0.5);
  gui.add(
    {
      "Next Product": () => {
        // code to be executed when button is clicked
        console.log("Button clicked!");
      },
    },
    "Next Product"
  );
  gui.add(
    {
      "Previous Product": () => {
        // code to be executed when button is clicked
        console.log("Button clicked!");
      },
    },
    "Previous Product"
  );
};
