var Reloader = Reloader || {};

Reloader.reload_file = function (path) {
  var x = document.createElement("script");
  x.setAttribute("src",path + "?rel=" + (new Date().getTime()));
  document.body.appendChild(x);
  setTimeout(function(){ document.body.removeChild(x);}, 1000);
}

Reloader.start_reloading = function (files) {
  setTimeout(function() {
    console.log("reloading files");
    files.map(Reloader.reload_file);
  }, 1000);
}

Reloader.start_reloading(["build/yome.js"])

function l(x) { console.log(x);  return x; }

var Yome = Yome || {};

Yome.initialState = { sides: [1,2,3,4,5,6,7,8].map(function(x) {return {}})}

Yome.sideCount = st => st.sides.length

Yome.sliceTheta = st => 2 * Math.PI / Yome.sideCount(st)

Yome.sliceDeg = st => 360 / Yome.sideCount(st)

Yome.rotate = (theta, point) => {
  const sint = Math.sin(theta), cost = Math.cos(theta);
  return { x: (point.x * cost) - (point.y * sint),
           y: (point.x * sint) + (point.y * cost) };
}

Yome.radialPoint = (radius, theta) =>
  Yome.rotate(theta, {x: 0, y: radius})

// dont' actually need this yet
Yome.radialLine = function(radius, start_theta, end_theta) {
  var start_p = Yome.radialPoint(radius, start_theta);
  var end_p =   Yome.radialPoint(radius, end_theta);
  return <line x1={start_p.x} y1={start_p.y} x2={end_p.x} y2={end_p.y}></line>;
}

Yome.sidePoints = st =>
  st.sides.map((_,i) => Yome.radialPoint(180, i * Yome.sliceTheta(st)))

Yome.pointsToPointsString = points =>
  points.map(p => `${p.x},${p.y}`).join(" ")

Yome.polygon = points =>
  <polygon points={ Yome.pointsToPointsString(points) }></polygon>

Yome.eventHandler = (f) =>
  (e => {e.preventDefault(); f(e.target.value); Yome.render()})

Yome.sideCountChange = (st)=>
  (new_count) => {
    let nArray = Array.apply(null, Array(parseInt(new_count)));
    st.sides = nArray.map((_,i) => st.sides[i] || {});
  }

Yome.sideOptions = () =>
  ["HexaYome", "SeptaYome","OctaYome"].map(
    (l, v) => <option value={v + 6}>{l}</option>)

Yome.sideCountInput = st => 
  <div className="form-control">
    <div>Number of Sides</div>
    <select onChange={ Yome.eventHandler(Yome.sideCountChange(st)) }
              value={ Yome.sideCount(st) }>
      { Yome.sideOptions()} 
    </select> 
  </div>

// draw window

Yome.windowPoints = (st) => {
  const theta = Yome.sliceTheta(st),
        indent = theta / 6;
  return [Yome.radialPoint(160, indent),
          Yome.radialPoint(160, theta - indent),
          Yome.radialPoint(100, theta / 2)];
}

Yome.drawWindow = (st) =>
  <polygon points={ Yome.pointsToPointsString(Yome.windowPoints(st)) }
           key="window"></polygon>

// draw door

Yome.doorPoints = (st) => {
  const indent = Yome.sliceTheta(st) / 8;
  return [Yome.radialPoint(165, indent ),
          Yome.radialPoint(165, -indent),
          Yome.radialPoint(90,  -indent),
          Yome.radialPoint(90, indent)];
}

Yome.drawDoor = (st) =>
  <polygon points={ Yome.pointsToPointsString(Yome.doorPoints(st)) }
           key="door-frame"></polygon>

Yome.drawStoveVent = (st) => {
  const theta = Yome.sliceTheta(st),
        point = Yome.radialPoint(155, 0);
  return <ellipse cx={point.x} cy={point.y} rx="14" ry="8"
                  key="stove-vent"></ellipse>
}

Yome.drawLine = (line) =>
  <line x1={line.start.x} y1={line.start.y} x2={line.end.x} y2={line.end.y}>
  </line>

Yome.drawZipDoor = (st) => {
  const theta   = Yome.sliceTheta(st),
        indent  = 0.15 * (theta / 6),
        lines   = [0,1,2,3,4,5,6,7,8].map((x) => {
          const dist = 170 - (10 * x);
          return {start: Yome.radialPoint(dist, -indent),
                  end:   Yome.radialPoint(dist, indent)}});
  lines.push({start: Yome.radialPoint(180, 0),
              end: Yome.radialPoint(90, 0)});
  return <g>{lines.map(Yome.drawLine)}</g>;
}

Yome.itemRender = {
  "window":     Yome.drawWindow,
  "door-frame": Yome.drawDoor,
  "zip-door":   Yome.drawZipDoor,
  "stove-vent": Yome.drawStoveVent,
}

Yome.sideSlice = (st, side, i) => {
  return <g transform={ `rotate(${ Yome.sliceDeg(st) * i },0,0)` }>
    { [side.window, side.corner].filter(x => x)
         .map(type => Yome.itemRender[ type ](st)) }
  </g>
}

// handling the corner controls

Yome.worldPosition = (point) => {return { x: point.x + 250, y: point.y + 250};}

// SIDE-EFFECT
Yome.addRemoveWindow = (side, i) =>
  (_) => side.window = (!side.window ? "window" : null);

Yome.windowControl = (st, side, i) => {
  let theta = Yome.sliceTheta(st) * (i + 1),
      pos   = Yome.worldPosition(Yome.radialPoint(200, theta)),
      add   = !side.window;
  return <div className="control-holder" style={{ top: pos.y, left: pos.x}}>
      <a className={ "window-control-offset " + (add ? "add" : "remove")}
         onClick={ Yome.eventHandler(Yome.addRemoveWindow(side, i)) } href="#">
         { add ? "+ window" : "- window" }
      </a>
  </div>
}

Yome.windowControls = (st) =>
  st.sides.map((side, i) => Yome.windowControl(st, side, i))

// corner control

Yome.cornerControlStateClass = (type, corner_type) => 
  ((! corner_type) && "add") || ((corner_type == type) && "remove") || "hidden"

Yome.addRemoveCornerItem = (type, side) =>
  (_) => side.corner = (side.corner ? null : type)

Yome.cornerControlLink = (type, side) =>
  <a className={Yome.cornerControlStateClass(type, side.corner)}
     key={ type } href="#" 
     onClick={Yome.eventHandler(Yome.addRemoveCornerItem(type, side))}>
      { (side.corner ? "- " : "+ ") + type }
  </a>

Yome.cornerControlLinks = (side, i) =>
  ["stove-vent", "zip-door", "door-frame"].map(
    (t) => Yome.cornerControlLink(t, side))
                                               
Yome.cornerControl = (st, side, i) => {
  let theta = Yome.sliceTheta(st) * (i + 0.5),
      pos   = Yome.worldPosition(Yome.radialPoint(221, theta));
  return <div className="control-holder" style={{ top: pos.y, left: pos.x }}>
      <div className="corner-control-offset">
        { Yome.cornerControlLinks(side, i) }
      </div>
    </div>
}

Yome.cornerControls = (st) =>
  st.sides.map((side, i) => Yome.cornerControl(st, side, i))

Yome.yomeControls = (st) =>
  <div className="yome-controls">
    { Yome.windowControls(st) }
    { Yome.cornerControls(st) }
  </div>

Yome.widget = function(st) {
  return <div className="yome-widget">
    { Yome.sideCountInput(st) }
    <div className="yome-widget-body">
      { Yome.yomeControls(st) }
      <svg height="500" width="500" viewBox="-250 -250 500 500"
           preserveAspectRatio="xMidYMid meet">
        <g transform={ `rotate(${Yome.sliceDeg(st) / 2},0,0)` }>
          { Yome.polygon(Yome.sidePoints(st)) }
          { st.sides.map((side, i) => Yome.sideSlice(st,side,i)) }
        </g>
    </svg>
    </div>
  </div>;
};

Yome.state = Yome.state || Yome.initialState;

Yome.render =
  () => React.render(Yome.widget(Yome.state),
                     document.getElementById('example'));

Yome.render();
