"use strict";

const ballVs = ` #version 300 es
in vec4 a_position;
in vec3 a_normal;
uniform mat4 u_projection;
uniform mat4 u_view;
uniform mat4 u_world;
uniform mat4 u_normalMatrix;
out vec3 v_normal;
out vec3 v_fragPos;
void main() {
  gl_Position = u_projection * u_view * u_world * a_position;
  v_normal = mat3(transpose(inverse(u_world))) * a_normal;
  v_fragPos = (u_world * a_position).xyz;
}
`;

const ballFs = `#version 300 es
precision mediump float;
uniform vec3 u_lightDirection;
uniform vec3 u_lightColor;
uniform vec3 u_ambientColor;
uniform vec3 u_viewPos;
in vec3 v_normal;
in vec3 v_fragPos;
out vec4 FragColor;
void main() {
  vec3 normal = normalize(v_normal);
  vec3 lightDir = normalize(-u_lightDirection);
  vec3 viewDir = normalize(u_viewPos - v_fragPos);
  vec3 reflectDir = reflect(-lightDir, normal);
  float diff = max(dot(normal, lightDir), 0.0);
  float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
  vec3 diffuse = u_lightColor * diff;
  vec3 specular = vec3(0.5) * u_lightColor * spec;
  vec3 ambient = u_ambientColor;
  vec3 finalColor = (diffuse + specular + ambient);
  FragColor = vec4(finalColor, 1.0);
}
`;
