var Reloader = Reloader || {};

Reloader.reloadFile = (path) => {
  var x = document.createElement("script");
  x.setAttribute("src",path + "?rel=" + (new Date().getTime()));
  document.body.appendChild(x);
  setTimeout(function(){ document.body.removeChild(x);}, 500);
}

Reloader.startReloading = (files) => {
  setTimeout(function() {
    console.log("--- reloading ---");
    files.map(Reloader.reloadFile);
  }, 1000);
}

Reloader.startReloading(["build/yome.js"])

function l(x) { console.log(x);  return x; }

var Yome = Yome || {};

Yome.initialState = () => {
  return { sides: [1,2,3,4,5,6,7,8].map( () => new Object() ) }
}

// Yome.state = Yome.state || Yome.initialState();
//l(Yome.state)

Yome.sideCount = (st) => st.sides.length
//l(Yome.sideCount(Yome.state))

Yome.sliceTheta = (st) => 2 * Math.PI / Yome.sideCount(st)
//l(Yome.sliceTheta(Yome.state))

Yome.rotate = (theta, point) => {
  const sint = Math.sin(theta), cost = Math.cos(theta);
  return { x: (point.x * cost) - (point.y * sint),
           y: (point.x * sint) + (point.y * cost) };
}
//l(Yome.rotate(Math.PI, {x: 0, y: 1}));

Yome.radialPoint = (radius, theta) =>
  Yome.rotate(theta, {x: 0, y: radius})
//l(Yome.radialPoint(100, Math.PI));

Yome.sidePoints = (st) =>
  st.sides.map((_,i) => Yome.radialPoint(180, i * Yome.sliceTheta(st)))
//l(Yome.sidePoints(Yome.initialState()))

Yome.pointsToPointsString = (points) =>
  points.map(p => p.x + "," + p.y).join(" ")
//l(Yome.pointsToPointsString(Yome.sidePoints(Yome.initialState())))

Yome.drawWalls = (state) =>
  <polygon points={Yome.pointsToPointsString(Yome.sidePoints(state))}>
  </polygon>

Yome.svgWorld = (children) =>
  <svg height="500" width="500" viewBox="-250 -250 500 500"
       preserveAspectRatio="xMidYMid meet">
    {children}
  </svg>  

Yome.playArea = (children) =>
  React.render(Yome.svgWorld(children), document.getElementById("playarea"))

Yome.clearPlayArea = () =>
  React.unmountComponentAtNode(document.getElementById("playarea"))

//Yome.playArea(Yome.drawWalls({sides: [1,2,3,4,5,6]}))
//Yome.playArea(Yome.drawWalls({sides: [1,2,3,4,5,6,7]}))
//Yome.playArea(Yome.drawWalls({sides: [1,2,3,4,5,6,7,8]}))

//Yome.clearPlayArea()

Yome.windowPoints = (st) => {
  const theta = Yome.sliceTheta(st),
        indent = theta / 6;
  return [Yome.radialPoint(160, indent),
          Yome.radialPoint(160, theta - indent),
          Yome.radialPoint(100, theta / 2)];
}
//l(Yome.windowPoints(Yome.initialState()))

Yome.drawWindow = (st) =>
  <polygon points={ Yome.pointsToPointsString(Yome.windowPoints(st)) }>
  </polygon>
  
//Yome.playArea(<g>{Yome.drawWindow(Yome.initialState())}
//                 {Yome.drawWalls(Yome.initialState())}</g>)

Yome.doorPoints = (st) => {
  const indent = Yome.sliceTheta(st) / 8;
  return [Yome.radialPoint(165, indent ),
          Yome.radialPoint(165, -indent),
          Yome.radialPoint(90,  -indent),
          Yome.radialPoint(90, indent)];
}

Yome.drawDoor = (st) =>
  <polygon points={ Yome.pointsToPointsString(Yome.doorPoints(st)) }>
  </polygon>

//Yome.playArea(<g>{Yome.drawDoor(Yome.state)}
//                 {Yome.drawWindow(Yome.state)}
//                 {Yome.drawWalls(Yome.state)}</g>)

Yome.drawLine = (line) =>
  <line x1={line.start.x} y1={line.start.y}
        x2={line.end.x} y2={line.end.y}>
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

//Yome.playArea(<g>{Yome.drawZipDoor(Yome.state)}
//                 {Yome.drawWalls(Yome.state)}</g>)

Yome.drawStoveVent = (st) => {
  const theta = Yome.sliceTheta(st),
        point = Yome.radialPoint(155, 0);
  return <ellipse cx={point.x} cy={point.y} rx="14" ry="8"
                  key="stove-vent"></ellipse>
}

//Yome.playArea(<g>{Yome.drawStoveVent(Yome.state)}
//                 {Yome.drawWalls(Yome.state)}</g>)

Yome.itemRenderDispatch = {
  "window":     Yome.drawWindow,
  "door-frame": Yome.drawDoor,
  "zip-door":   Yome.drawZipDoor,
  "stove-vent": Yome.drawStoveVent,
}

Yome.itemRender = (type, st) => 
  (Yome.itemRenderDispatch[type] || (x => null))(st)

Yome.exampleData = ((state)=>{
  state.sides[0].face = "window"
  state.sides[0].corner = "zip-door"
  state.sides[3].face = "window"
  state.sides[5].corner = "door-frame"
  state.sides[5].face = "window"
  state.sides[7].corner = "stove-vent"
  return state
})(Yome.initialState())

//l(JSON.stringify(Yome.exampleData))

Yome.sliceDeg = (st) => 360 / Yome.sideCount(st)

Yome.sideSlice = (st, i) => {
  const side = st.sides[i];
  if(side.corner || side.face)        
    return  <g transform={ "rotate(" +  (Yome.sliceDeg(st) * i) + ",0,0)" }>
      {Yome.itemRender(side.corner, st)}
      {Yome.itemRender(side.face,   st)}  
    </g>
}

//Yome.playArea(Yome.sideSlice(Yome.exampleData, 5))
//Yome.playArea(Yome.sideSlice(Yome.exampleData, 0))

Yome.drawYome = (st) =>
  <g transform={ "rotate(" + (Yome.sliceDeg(st) / 2) + ",0,0)" }>
    { Yome.drawWalls(st) }
    { st.sides.map((side, i) => Yome.sideSlice(st,i)) }
  </g>

//Yome.playArea(Yome.drawYome(Yome.exampleData))
//Yome.clearPlayArea()

//side effecting
Yome.prevent = (f) =>
  (e => {e.preventDefault(); f(e.target.value);})

//side effecting
Yome.changeSideCount = (state) =>
  (new_count) => {
    let nArray = Array.apply(null, Array(parseInt(new_count)));
    state.changeState((st) => st.sides = nArray.map((_,i) => st.sides[i] || {}))
  }

//Yome.changeSideCount(6)
//Yome.changeSideCount(7)
//Yome.changeSideCount(8)

Yome.sideOptions = () =>
  ["HexaYome", "SeptaYome","OctaYome"].map(
    (l, v) => <option value={v + 6}>{l}</option>)

Yome.sideCountInput = st => 
  <div className="top-control">
    <span> Size of Yome </span>
    <select onChange={ Yome.prevent(Yome.changeSideCount(st)) }
            value={ Yome.sideCount(st) }>
      { Yome.sideOptions() } 
    </select> 
  </div>
//React.render(Yome.sideCountInput(Yome.state),
//             document.getElementById("playarea"))
//Yome.clearPlayArea()

Yome.worldPosition = (point) => ({ x: point.x + 250, y: point.y + 250})

Yome.addRemoveWindow = (state, i) =>
  (_) => {
    state.changeState(
      (st) => {
        const side = st.sides[i];
        side.face = (!side.face ? "window" : null);    
      })
  }

Yome.windowControl = (st, side, i) => {
  let theta = Yome.sliceTheta(st) * (i + 1),
      pos   = Yome.worldPosition(Yome.radialPoint(200, theta)),
      add   = !side.face;
  return <div className="control-holder" style={ { top:  pos.y,
                                                   left: pos.x } }>
    <a className={ "window-control-offset " +
                   (add ? "add" : "remove")}
       onClick={ Yome.prevent(Yome.addRemoveWindow(st, i)) }
       href="#">
       { add ? "+ window" : "- window" }
    </a>
  </div>
}

Yome.windowControls = (st) =>
  st.sides.map((side, i) => Yome.windowControl(st, side, i))

// --- Corner Controls

// SIDE EFFECT
Yome.addRemoveCornerItem = (state, type, i) =>
  (_) =>
    state.changeState(st => {
      st.sides[i].corner = (st.sides[i].corner ? null : type)                   
    })

Yome.cornerControlStateClass = (type, corner_type) => 
  ((! corner_type) && "add") || ((corner_type == type) && "remove") || "hidden"

Yome.cornerControlLink = (state, type, i) => {
  const side = state.sides[i];
  return <a className={Yome.cornerControlStateClass(type, side.corner)}
     key={ type } href="#" 
     onClick={ Yome.prevent(Yome.addRemoveCornerItem(state, type, i)) }>
      { (side.corner ? "- " : "+ ") + type }
  </a>
}

Yome.cornerControlLinks = (state, i) =>
  ["stove-vent", "zip-door", "door-frame"].map(
    (t) => Yome.cornerControlLink(state, t, i))
                                               
Yome.cornerControl = (st, i) => {
  let side = st.sides[i],
      theta = Yome.sliceTheta(st) * (i + 0.5),
      pos   = Yome.worldPosition(Yome.radialPoint(221, theta));
  return <div className="control-holder" style={{ top: pos.y, left: pos.x }}>
      <div className="corner-control-offset">
      { Yome.cornerControlLinks(st, i) }
      </div>
    </div>
}

Yome.StateHolder = function(sides, renderFunc) {
  this.sides = sides;
  this.__render = renderFunc;
}

Yome.StateHolder.prototype.changeState = function(f) {
  f(this);
  this.__render()
}

Yome.cornerControls = (st) =>
  st.sides.map((_, i) => Yome.cornerControl(st, i))

// --- Add new code above this line ---

Yome.widget = (st) =>
  <div className="yome-widget">
  { Yome.sideCountInput(st) }
  <div className="yome-widget-body">
     { Yome.windowControls(st) }
     { Yome.cornerControls(st) }
     { Yome.svgWorld(Yome.drawYome(st)) }
    </div>
  </div>

Yome.state = Yome.state ||
  new Yome.StateHolder(Yome.initialState().sides,
                       () => { React.render(Yome.widget(Yome.state), document.getElementById('app'))} );

Yome.state.__render()
