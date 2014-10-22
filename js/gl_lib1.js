
// Wait 100 milliseconds after the page loads before starting gl.

function start_gl(canvas_id, vs, fs) {
   setTimeout(function() {
      try {
         var canvas = document.getElementById(canvas_id);
         var gl = canvas.getContext("experimental-webgl");

	 // Catch mouse events that go to the canvas.

	 function setMouse(eventZ) {
	    var r = event.target.getBoundingClientRect();
	    gl.mouseX = (event.clientX - r.left  ) / (r.right - r.left) * 2 - 1;
       // console.log(gl.mouseX);
	    gl.mouseY = (event.clientY - r.bottom) / (r.top - r.bottom) * 2 - 1;
       // console.log(gl.mouseX);
       // console.log(gl.mouseY);
	    if (eventZ !== undefined) gl.mouseZ = eventZ;
	 }
	 canvas.onmousedown = function(event) { setMouse(1); }
	 canvas.onmousemove = function(event) { setMouse(); }
	 canvas.onmouseup   = function(event) { setMouse(0); }
	 gl.mouseX = gl.mouseY = gl.mouseZ = 0;

	 // Initialize gl. Then start the frame loop.

         gl_init(gl, vs, fs);
         gl_update(gl);

      } catch (e) { console.log(e); }
   }, 1000);
}

// Initialize gl and create a square, given vertex and fragment shader defs.

function gl_init(gl, vs, fs) {

   // Function to create and attach a shader to a gl program.

   function addshader(type, src) {
      var shader = gl.createShader(type);
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      if (! gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
         throw "Cannot compile shader:\n\n" + gl.getShaderInfoLog(shader);
      }
      gl.attachShader(prog, shader);
   };

   // Create and link the gl program, using the vertex and fragment shaders.

   var prog = gl.createProgram();
   addshader(gl.VERTEX_SHADER, vs);
   addshader(gl.FRAGMENT_SHADER, fs);
   gl.linkProgram(prog);
   if (! gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      throw "Could not link the shader program!";
   }
   gl.useProgram(prog);

   // Create the square shape as a strip of two triangles.

   gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
   gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([ -1,1,0, 1,1,0, -1,-1,0, 1,-1,0 ]), gl.STATIC_DRAW);

   // Assign attribute a_pos to the vertex locations of the square.

   gl.a_pos = gl.getAttribLocation(prog, "a_pos");
   gl.enableVertexAttribArray(gl.a_pos);
   gl.vertexAttribPointer(gl.a_pos, 3, gl.FLOAT, false, 0, 0);

   // Get the address in the fragment shader of each of my uniform variables.

   gl.u_time  = gl.getUniformLocation(prog, "u_time");
   gl.u_mouse = gl.getUniformLocation(prog, "u_mouse");
}

// Update is called once per animation frame.

function gl_update(gl) {

   // Set values for my uniform variables for this frame.

   gl.uniform1f(gl.u_time , ((new Date()).getTime() - startTime) / 1000);
   gl.uniform3f(gl.u_mouse, gl.mouseX, gl.mouseY, gl.mouseZ);

   // Render the square.

   gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

   // gl_update() "calls" itself again.  This will make it loop.

   requestAnimFrame(function() { gl_update(gl); });
}

// A browser-independent way to call a callback function every 1/60 second.

requestAnimFrame = (function(callback) {
      return requestAnimationFrame
          || webkitRequestAnimationFrame
          || mozRequestAnimationFrame
          || oRequestAnimationFrame
          || msRequestAnimationFrame
          || function(callback) { setTimeout(callback, 1000 / 60); }; })();

// Remember what time we started, so we can pass relative time to shaders.

var startTime = (new Date()).getTime();

