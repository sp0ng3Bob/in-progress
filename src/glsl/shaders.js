const vertex = `#version 300 es
precision mediump float;

layout (location = 0) in vec4 aPosition; //vec3 aPosition
layout (location = 1) in vec2 aTexCoord;
layout (location = 2) in vec4 aNormal;

/* SKINNING */
layout (location = 3) in vec4 aJoint0;
layout (location = 5) in vec4 aWeight0;
layout (location = 4) in vec4 aJoint1;
layout (location = 6) in vec4 aWeight1;

layout (location = 7) in vec4 aTangent;

uniform mat4 uMvpMatrix;

//out vec4 gl_Position;
out vec3 vNormal;
out vec2 vTexCoord;
out vec4 vTangent;

void main() {
  gl_Position = uMvpMatrix * aPosition; //vec4(aPosition, 1.0);
  vNormal = (uMvpMatrix * aNormal).xyz;
  vTexCoord = aTexCoord;
  vTangent = aTangent;
}
`

const fragment = `#version 300 es
precision mediump float;
precision mediump int;

uniform sampler2D uTexture;

uniform sampler2D uNormalTexture;
uniform float uNormalTextureScale;

uniform sampler2D uEmissiveTexture;
uniform vec3 uEmissiveFactor;

uniform sampler2D uMetallicRoughnessTexture;
uniform float uMetallicFactor;
uniform float uRoughnessFactor;

uniform sampler2D uOcclusionTexture;
uniform float uOcclusionStrength;

// LIGHTS
//uniform int uNumberOfLights;
uniform vec3 uLightPositions[4]; //uNumberOfLights]
uniform vec3 uLightColors[4]; //uNumberOfLights]
uniform vec3 uDiffuseColor[4]; //= vec3(200, 200, 180)
uniform vec3 uSpecularColor[4];  // Material specular color
uniform vec3 uAmbientalColor[4];  // Material specular color
uniform float uShininess[4];  // Material shininess
uniform float uAttenuation[4];  // Material shininess

in vec3 vNormal;
in vec2 vTexCoord;
in vec4 vTangent;

out vec4 oColor;

void main() {
  vec4 albedo = texture(uTexture, vTexCoord);
  vec3 normal = normalize(vNormal);
  
  
  
  // Lambertian reflection (diffuse reflection)
  vec3 diffuse = vec3(0.0);
  
  for (int i = 0; i < 4; i++) {
    vec3 lightDir = normalize(uLightPositions[i] - vec3(vTexCoord, 0.0));
    float lambertian = max(dot(normal, lightDir), 0.0);
    diffuse += uLightColors[i] * uDiffuseColor[i] * lambertian;
  }
  
  vec3 finalColor = albedo.rgb * (diffuse + uAmbientalColor[0]);
  oColor = vec4(finalColor, albedo.a);
  
  
  
  
  // Phong reflection model
  /*vec3 viewDir = normalize(normal - vec3(vTexCoord, 0.0));
  vec3 resultColor = vec3(0.0);
  
  for (int i = 0; i < 4; i++) {
    vec3 lightDir = normalize(uLightPositions[i] - vec3(vTexCoord, 0.0));
    vec3 reflectDir = reflect(-lightDir, normal);

    // Phong reflection model
    float lambertian = max(dot(normal, lightDir), 0.0);
    float phong = pow(max(dot(reflectDir, viewDir), 0.0), uShininess[i]);

    // Combine diffuse and specular components;
    vec3 diffuse = uDiffuseColor[i] * lambertian;
    vec3 specular = uSpecularColor[i] * phong;

    resultColor += uLightColors[i] * (diffuse + specular); // * uAttenuation[i];
  }

  vec3 finalColor = albedo.rgb * (resultColor + uAmbientalColor[0]);
  //finalColor = mix(albedo.rgb, uSpecularColor);
  oColor = vec4(finalColor, albedo.a);*/


  
  //oColor = texture(uNormalTexture, vTexCoord);
  //oColor = vec4(normal, 1);
}`

/* const fragment = `#version 300 es
precision mediump float
precision mediump int

uniform sampler2D uTexture

uniform sampler2D uNormalTexture
uniform float uNormalTextureScale

uniform sampler2D uEmissiveTexture
uniform vec3 uEmissiveFactor

uniform sampler2D uMetallicRoughnessTexture
uniform float uMetallicFactor
uniform float uRoughnessFactor

uniform sampler2D uOcclusionTexture
uniform float uOcclusionStrength

// LIGHTS
//uniform int uNumberOfLights
uniform vec3 uLightPositions[4] //uNumberOfLights]
uniform vec3 uLightColors[4] //uNumberOfLights]
//uniform vec3 uDiffuseColor = vec3(200, 200, 180)
uniform vec3 uSpecularColor  // Material specular color
uniform float uShininess  // Material shininess

in vec3 vNormal
in vec2 vTexCoord
in vec4 vTangent

out vec4 oColor

void main() {
  //vec3 uDiffuseColor = vec3(200, 200, 180)
  //vec4 albedo = texture(uTexture, vTexCoord)
  //vec3 normal = normalize(vNormal)

  // Lambertian reflection (diffuse reflection)
  /*vec3 diffuse = vec3(0.0)

  for (int i = 0 i < 2 i++) {
    vec3 lightDir = normalize(uLightPositions[i] - vec3(vTexCoord, 0.0))
    float lambertian = max(dot(normal, lightDir), 0.0)
    diffuse += uLightColors[i] * uDiffuseColor * lambertian
  }

  vec3 finalColor = albedo.rgb * diffuse
  oColor = vec4(finalColor, albedo.a)




  // Phong reflection model - no ambiental color!
  /*vec3 viewDir = normalize(vNormal - vec3(vTexCoord, 0.0)) //normalize(normal - vec3(vTexCoord, 0.0))
  vec3 resultColor = vec3(0.0)

  for (int i = 0 i < 2 i++) {
    vec3 lightDir = normalize(uLightPositions[i] - vec3(vTexCoord, 0.0))
    vec3 reflectDir = reflect(-lightDir, normal)

    // Phong reflection model
    float lambertian = max(dot(normal, lightDir), 0.0)
    float specular = pow(max(dot(reflectDir, viewDir), 0.0), uShininess)

    // Combine diffuse and specular components
    vec3 diffuse = uDiffuseColor * lambertian
    vec3 specularComponent = uSpecularColor * specular

    resultColor += uLightColors[i] * (diffuse + specularComponent)
  }

  vec3 finalColor = albedo.rgb * resultColor
  finalColor = mix(albedo.rgb, uSpecularColor)
  oColor = vec4(finalColor, albedo.a)


  
  //oColor = texture(uTexture, vTexCoord)
  oColor = texture(uNormalTexture, vTexCoord)
}` */

const axesVert = `#version 300 es
precision mediump float;
in vec4 aPosition;
uniform mat4 uModelViewProjection;
out vec4 vColor;
void main() {
    gl_Position = uModelViewProjection * aPosition;
    vColor = aPosition * 0.5 + 0.5;
}`

const axesFrag = `#version 300 es
precision mediump float;
in vec4 vColor;
out vec4 oColor;
void main() {
  oColor = vColor;
}`

export const shaders = {
  simple: { vertex, fragment },
  axes: { vertex: axesVert, fragment: axesFrag }
}
