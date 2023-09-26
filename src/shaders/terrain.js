"use strict";

// Vertex Shader
const terrainVs = `#version 300 es
  in vec4 a_position;
  in vec2 a_texcoord;
  
  uniform mat4 u_world;
  uniform mat4 u_projection;
  uniform mat4 u_view;
  
  uniform vec3 u_viewWorldPosition;
  uniform vec3 u_lightWorldPosition;
  
  uniform sampler2D displacementMap;
  
  out vec2 v_texcoord;
  out vec3 v_surfaceToLight;
  out vec3 v_surfaceToView;
  out vec3 v_worldPosition;
  void main() {
    float displacementScale = 400.0;
    float displacement = texture(displacementMap, a_texcoord).r * displacementScale;
    vec4 displaced_position = a_position + vec4(10, displacement, 0, 0);
    gl_Position =  u_projection * u_view * u_world * displaced_position;
    
    v_texcoord = a_texcoord;
    vec3 surfaceWorldPosition = (u_world * displaced_position).xyz;
    v_surfaceToLight = u_lightWorldPosition - surfaceWorldPosition;
    v_surfaceToView = u_viewWorldPosition - surfaceWorldPosition;
    v_worldPosition = surfaceWorldPosition;
  }
`;

const terrainFs = `#version 300 es
  precision highp float;
  
  in vec3 v_surfaceToView;
  in vec3 v_surfaceToLight;
  in vec3 v_worldPosition;
  in vec2 v_texcoord;
  
  uniform vec3 u_lightDirection;
  uniform sampler2D normalMap;
  const float kc = 0.3;
  const float kl = 0.001;
  const float kq = 0.0001;
  
  out vec4 outColor;
  
  void main() {
    vec3 dx = dFdx(v_worldPosition);
    vec3 dy = dFdy(v_worldPosition);
    vec3 normal = normalize(cross(dx, dy));
    
    vec3 lightDirection = normalize(u_lightDirection);
    vec3 color = vec3(0.65, 0.83, 0.87);
    
    float ambient = 0.0;
    float diffuse = max(dot(normal, lightDirection), 0.0);
    
    float distance = length(v_surfaceToLight);
    vec3 pointLightDirection = normalize(v_surfaceToLight);
    float attenuation = 1.0 / (kc + kl * distance + kq * distance * distance);
    float pointDiffuse = max(dot(normal, pointLightDirection), 0.0);
    float specular = .1;
    
    float light = ambient + pointDiffuse * attenuation + diffuse + specular;
    
    outColor = vec4(color * light, 1.0);
  }
`;
