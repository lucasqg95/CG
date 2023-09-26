"use strict";

const ballVs = ` #version 300 es

in vec4 position;
uniform mat4 u_projection;
uniform mat4 u_view;
uniform mat4 u_model;

void main() {
    gl_Position = u_projection * u_view * u_model * position;
}
`;

const ballFs = `#version 300 es
precision mediump float;

out vec4 fragColor;

void main() {
    fragColor = vec4(1.0, 0.0, 0.0, 1.0);
}
`;
