var Reloader = Reloader || {};

Reloader.reload_file = function (path) {
  var x = document.createElement("script");
  x.setAttribute("src",path + "?rel=" + (new Date().getTime()));
  document.body.appendChild(x);
  setTimeout(function(){ document.body.removeChild(x);}, 1000);
}

Reloader.start_reloading = function (files) {
  setTimeout(function() { console.log("reloading file");
                   files.map(Reloader.reload_file); }, 3000)}

Reloader.start_reloading(["build/yome.js"])                             

function l(x) { console.log(x);  return x; }

var Yome = Yome || {};

Yome.initial_state = function(){
  
};

Yome.state = Yome.state || { sides: [0,1,2,3,4,5,6,7,8].map(function() { return {face: false}; })};

Yome.rotate = function(theta, point) {
  var sint =  Math.sin(theta);
  var cost =  Math.cos(theta);
  return {x: (point.x * cost) - (point.y * sint),
          y: (point.x * sint) + (point.y * cost)};
};

Yome.radial_point = function(radius, theta) {
  return this.rotate(theta, {x: 0, y: radius});
}

Yome.radial_line = function(radius, start_theta, end_theta) {
  var start_p = this.radial_point(radius, start_theta);
  var end_p =   this.radial_point(radius, end_theta);
  return <line x1={start_p.x} y1={start_p.y} x2={end_p.x} y2={end_p.y}></line>;
}

//l(Yome.rotate(Math.PI / 2, {x: 1, y:1}));
//l(Yome.radial_point(1, Math.PI))

Yome.widget = function(s) {
    return <svg height="500" width="500" viewBox="-250 -250 500 500" preserveAspectRatio="xMidYMid meet">
      { Yome.radial_line(180, 0, Math.PI / 8) }
    </svg>;
};

React.render(
  Yome.widget(Yome.state),
  document.getElementById('example')
);
