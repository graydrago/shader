function main () {
  var canvas = <HTMLCanvasElement> document.getElementById("canvas");
  var gl : WebGLRenderingContext;
  try {
    gl = <WebGLRenderingContext> canvas.getContext("webgl");
  } catch (e) {
    console.log("WebGL doesn't support") ;
    return false;
  }

  function get_shader(gl : WebGLRenderingContext, source, _type) {
      var shader = gl.createShader(_type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
          console.log(`error shader : ${gl.getShaderInfoLog(shader)}`);
          gl.deleteShader(shader);
          return false;
      }
      return shader;
  };

  function create_program(gl : WebGLRenderingContext, vertex_shader, fragment_shader) {
      var program = gl.createProgram();
      gl.attachShader(program, vertex_shader);
      gl.attachShader(program, fragment_shader);
      gl.linkProgram(program);

      var is_ok = gl.getProgramParameter(program, gl.LINK_STATUS);
      if (is_ok) {
          return program;
      }

      console.error(gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
  }

  var shader_vertex_source = `
    // an attribute will receive data from a buffer
    attribute vec4 a_position;

    uniform float u_time;
 
    // all shaders have a main function
    void main() {
 
      // gl_Position is a special variable a vertex shader
      // is responsible for setting
      gl_Position = a_position;
    }
  `;

  var shader_fragment_source=`
    precision highp float;

    uniform float u_time;

    void main(void) {
        gl_FragColor = vec4(0.5 + sin(u_time) / 2.0, 0, 0.5, 1);
    }
  `;


  var shader_vertex = get_shader(gl, shader_vertex_source, gl.VERTEX_SHADER);
  var shader_fragment = get_shader(gl, shader_fragment_source, gl.FRAGMENT_SHADER);

  var program = create_program(gl, shader_vertex, shader_fragment);
  var posAttributeLocaton = gl.getAttribLocation(program, "a_position");

  var triangle_vertex_data = [
    -1,-1,
     0, 1,
     1,-1
  ];

  var triangle_vertex_buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, triangle_vertex_buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangle_vertex_data), gl.STATIC_DRAW);

  //FACES :
  var triangle_indexes_data = [0,2,1];
  var triangle_indexes_buf = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangle_indexes_buf);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(triangle_indexes_data), gl.STATIC_DRAW);

  gl.enableVertexAttribArray(posAttributeLocaton);
  gl.vertexAttribPointer(posAttributeLocaton, 2, gl.FLOAT, false, 0, 0);

  var timeUniformLocaton = gl.getUniformLocation(program, "u_time");
  //var timeLoc = gl.getUniformLocation(timeAttributeLocaton);



  /*========================= DRAWING ========================= */
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.viewport(0.0, 0.0, canvas.width, canvas.height);
  gl.useProgram(program);

  var start = 0;

  var animate = function(timestamp) {
    var elapsed = timestamp - start;

    gl.uniform1f(timeUniformLocaton, timestamp / 1000);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawElements(gl.TRIANGLES, 3, gl.UNSIGNED_SHORT, 0);

    gl.flush();

    window.requestAnimationFrame(animate);
  };

  window.requestAnimationFrame(animate);
  //animate();
};

window.addEventListener("load", () => {
    main();
});
