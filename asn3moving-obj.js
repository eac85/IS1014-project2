// All of your asn3 changes should be in this js file rather than the html
// You will not modify asn3moving-obj.html or gl-matrix.js but they will
// both have to be in the same directory as this asn3moving-obj.js file.
// Your job is to replace the flying triangle with some more interesting
// design of your own and make it move in some other interesting pattern.
// This template code has all of the principle elements so you are just
// elaborating on the existing structure.

window.onload = initialize;	// this starts everything else

function initialize() {
     initializeCanvas();	// These initializations are only done once
     initializeModels();
     initializeShaders();
     initializeProgram();
     draw();			// draw will call itself by timed events
}

var canvas = null;
var gl = null;

function initializeCanvas() {
    var canvas = document.getElementById('asn3-canvas');
    gl = canvas.getContext("webgl") || canvas.getContext('webgl');
    if(gl) {
	gl.viewportWidth = canvas.width;
	gl.viewportHeight = canvas.height;
	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);
	gl.clearColor(0.1, 0.2, 0.7, 1.0);	// deep blue sky
	gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
     }
}

var verticeBufferObject = null;
var verticeColorBufferObject = null;

// XXX you should devise your own object "Model" and color it as you wish
function initializeModels() {
    var verticeArray = new Float32Array([
	0,0,0,
    -.5, .5, -.25,
    .5, .5, -.75,
    .5, .5, .75,
     -.5, .5, -.25,
     .5, .5, -.75,
    
    
    


	// one flying triangle for now
    ]);
    var verticeColorArray = new Float32Array([
	0.3,0,1,1, 
    0.3,0.4,1,1, 
    0.3,0.5,1,1, 
    0.3,0.6,1,1, 
    0.3,0.7,1,1, 
    0.3,0.8,1,1, 

     	// distinct colors for now
    ]);
    verticeBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, verticeBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, verticeArray, gl.STATIC_DRAW);
    verticeColorBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, verticeColorBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, verticeColorArray, gl.STATIC_DRAW);
}

var vertexShader = null;
var fragmentShader = null;
function initializeShaders() {
    var vertexShaderCode =
	'attribute vec3 aVertexPosition;'+
	'attribute vec4 aVertexColor;'+
	'uniform mat4 uMVMatrix;'+
	'uniform mat4 uPMatrix;'+
	'varying lowp vec4 vertexColor;'+
	'void main(void)'+
	'{'+
	'gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);'+
		'vertexColor = aVertexColor;'+
   	'}';
    vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderCode);
    gl.compileShader(vertexShader);

    var fragmentShaderCode =
	'varying lowp vec4 vertexColor;'+
	'void main(void)'+
	'{'+
		'gl_FragColor = vertexColor;'+
	'}';
    fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderCode);
    gl.compileShader(fragmentShader);
}

var program = null;

function initializeProgram() {
    program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);
    program.vertPos = gl.getAttribLocation(program, "aVertexPosition");
    gl.enableVertexAttribArray(program.vertPos);
    program.vertexColorAttrib = gl.getAttribLocation(program, "aVertexColor");
    gl.enableVertexAttribArray(program.vertexColorAttrib);
    program.pMatrixUniform = gl.getUniformLocation(program, "uPMatrix");
    program.mvMatrixUniform = gl.getUniformLocation(program, "uMVMatrix");
}

var mvMatrix = mat4.create();
var pMatrix = mat4.create();
var x = -2, y = -1.5, z = -60.0;	// the starting XYZ position
var deltax = 0.03, deltay = 0.09, deltaz = .5; // velocity as deltaXYZ/step
var rotX = -1, rotY = 1, rotZ = 1;	// the starting rotational orientation
var rotDeg = 0;
var vertSize = 3, numVertices = 6;
var ndraw = 0;

// XXX replace the motion parts of draw() to implement some interesting
// 3D motion path of your own design. Perhaps something with oscillations?
// Also, consider keeping your object pointed in its direction of motion.
function draw() {
     ndraw++;		// not really needed but illustrates a discussion point
     x -= deltax;	// to get position we are "integrating" velocity
     y += deltay;
     z += deltaz;
     if(z > 0) {	// reinitialize position+rotation when object passes
	x = -2;
	y = -1.5;
	z = -60.0;
	rotDeg = 0;
    }
    rotDeg += 20;	// .5 deg additional rotation per time step
    if(rotDeg >= 360)	// often convenient to reset large rotations to 0
	rotDeg -= 360;
    mat4.perspective(
	pMatrix,45*Math.PI/180, gl.viewportWidth / gl.viewportHeight, 1, 100);
    mat4.identity(mvMatrix);
    mat4.translate(mvMatrix,mvMatrix,[x,y,z]);
    mat4.rotate(mvMatrix,mvMatrix,rotDeg*Math.PI/180, [rotX,rotY,rotZ]);
    gl.bindBuffer(gl.ARRAY_BUFFER, verticeBufferObject);
    gl.vertexAttribPointer(program.vertPos, vertSize, gl.FLOAT, false,0,0);
    gl.bindBuffer(gl.ARRAY_BUFFER, verticeColorBufferObject);
    gl.vertexAttribPointer(program.vertexColorAttrib, 4, gl.FLOAT, false, 0, 0);
    gl.uniformMatrix4fv(program.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(program.mvMatrixUniform, false, mvMatrix);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, numVertices);
    setTimeout("draw()", 50); // redraw after 50ms delay
}