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

Yome.initialState = { sides: [1,2,3,4,5,6,7,8].map(() => {}) }

Yome.state = Yome.state || Yome.initialState;

Yome.swap = f => { Yome.state = f(Yome.state); Yome.render(); }

Yome.sideCount = st => st.sides.length

Yome.sliceTheta = st => 2 * Math.PI / Yome.sideCount(st)

Yome.sliceDeg = st => 360 / Yome.sideCount(st)

Yome.rotate = (theta, point) => {
  const sint = Math.sin(theta), cost = Math.cos(theta);
  return { x: (point.x * cost) - (point.y * sint),
           y: (point.x * sint) + (point.y * cost) };
}

Yome.radialPoint = (radius, theta) => Yome.rotate(theta, {x: 0, y: radius})

// dont' actually need this yet
Yome.radialLine = function(radius, start_theta, end_theta) {
  var start_p = Yome.radialPoint(radius, start_theta);
  var end_p =   Yome.radialPoint(radius, end_theta);
  return <line x1={start_p.x} y1={start_p.y} x2={end_p.x} y2={end_p.y}></line>;
}

Yome.pointsToPointsString = points => points.map(p => `${p.x},${p.y}`).join(" ")

Yome.polygon = points => <polygon points={ Yome.pointsToPointsString(points) }></polygon>

Yome.sidePoints = st =>
  st.sides.map((_,i) => Yome.radialPoint(180, i * Yome.sliceTheta(st)))

Yome.preventValueHandler = f => (e => {e.preventDefault(); f(e.target.value)})

Yome.sideCountChange = new_count => {
  Yome.swap( st => {
    let nArray = Array.apply(null, Array(parseInt(new_count)));
    st.sides = nArray.map((_,i) => st.sides[i] || {});
    return st;
  });
}

Yome.sideCountChangeHandler = Yome.preventValueHandler(Yome.sideCountChange);

Yome.sideCountInput = st => 
  <div className="form-control">
  <label>Number of Sides</label>
    <select onChange={ Yome.sideCountChangeHandler }>
      { ["HexaYome", "SeptaYome", "OctaYome"].map(
           (l, v) => <option value={v + 6}>{l}</option>
        ) } 
    </select> 
  </div>;

Yome.windowPoints = (st) => {
  const theta = Yome.sliceTheta(st),
        indent = theta / 6;
  return [Yome.radialPoint(160, indent),
          Yome.radialPoint(160, theta - indent),
          Yome.radialPoint(100, theta / 2)];
}

Yome.drawWindow = (st) =>
  <polygon points={Yome.pointsToPointsString(Yome.windowPoints(st))}>
  </polygon>

Yome.sideSlice = (st, side, i) => {
  return <g transform={ `rotate(${ Yome.sliceDeg(st) * i },0,0)` }>
    { side.face ? Yome.drawWindow(st) : null }
  </g>
}

//l(Yome.sidePoints(Yome.state));

// l(Yome.pointsToPointsString([{x: 1, y: 2}, {x:3,y:4}]));

//l(Yome.rotate(Math.PI / 2, {x: 1, y:1}));
//l(Yome.radial_point(1, Math.PI))

Yome.widget = function(st) {
  return <div className="yome-widget">
    { Yome.sideCountInput(st) }
    <svg height="500" width="500" viewBox="-250 -250 500 500"
      preserveAspectRatio="xMidYMid meet">
      <g transform={ `rotate(${Yome.sliceDeg(st) / 2},0,0)` }>
        { Yome.polygon(Yome.sidePoints(st)) }
        <g>{ st.sides.map((side, i) => Yome.sideSlice(st,side,i)) }</g>
      </g>
    </svg>
  </div>;
};

Yome.render = () => React.render(Yome.widget(Yome.state), document.getElementById('example'));

Yome.render();
