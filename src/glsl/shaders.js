const gltfVertex = `#version 300 es
precision mediump float;

layout (location = 0) in vec3 aPosition;
layout (location = 1) in vec2 aTexCoord;
layout (location = 15) in vec2 aTexCoord1;
layout (location = 2) in vec3 aNormal;

/* SKINNING */
uniform int uHasSkinning;
layout (location = 3) in vec4 aJoint0;
layout (location = 5) in vec4 aWeight0;
layout (location = 4) in vec4 aJoint1;
layout (location = 6) in vec4 aWeight1;

layout (location = 7) in vec4 aTangent;

/* Morph target weights */
layout(location = 8) in vec3 aPositionTarget0;
layout(location = 9) in vec3 aPositionTarget1;
layout(location = 10) in vec3 aNormalTarget0;
layout(location = 11) in vec3 aNormalTarget1;
layout(location = 12) in vec3 aTangentTarget0;
layout(location = 13) in vec3 aTangentTarget1;

layout(location = 14) in vec4 aColor0;

uniform float uMorphTargetWeight0;
uniform float uMorphTargetWeight1;

uniform mat4 uMvpMatrix;

uniform mat4 u_jointMatrix[2];
/*uniform JointMatrix
{
    mat4 matrix[65];
} u_jointMatrix;*/

uniform mat4 uModelMatrix;

out vec4 vColor0;
out vec3 vNormal;
out vec2 vTexCoord;
out vec2 vTexCoord1;
out vec4 vTangent;

out vec3 vFragPosition;

void main() {
  gl_PointSize = 5.0;
  gl_Position = uMvpMatrix * vec4(aPosition, 1.0);
  vNormal = aNormal; //(uModelMatrix * vec4(aNormal, 0.0)).xyz;
  vTexCoord = aTexCoord;
  vTexCoord1 = aTexCoord1;
  vTangent = aTangent;
  vColor0 = aColor0;

  vec4 worldPosition = (uModelMatrix * vec4(aPosition, 1.0));
  vFragPosition = worldPosition.xyz / worldPosition.w;
}`

//https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#appendix-b-brdf-implementation
const gltfFragment = `#version 300 es
precision mediump float;

uniform vec4 uBaseColor;
uniform sampler2D uTexture;
uniform int uHasBaseColorTexture;
uniform int uBaseColorTexCoord;

uniform sampler2D uNormalTexture;
uniform int uHasNormalTexture;
uniform int uNormalTexCoord;
uniform float uNormalTextureScale;

uniform sampler2D uEmissiveTexture;
uniform int uHasEmissiveTexture;
uniform int uEmissiveTexCoord;
uniform vec3 uEmissiveFactor;

uniform sampler2D uMetallicRoughnessTexture;
uniform int uHasMetallicRoughnessTexture;
uniform int uMetallicRoughnessTexCoord;
uniform float uMetallicFactor;
uniform float uRoughnessFactor;

uniform sampler2D uOcclusionTexture;
uniform int uHasOcclusionTexture;
uniform int uOcclusionTexCoord;
uniform float uOcclusionStrength;

uniform int uAlphaMode;
uniform float uAlphaCutoff;

// LIGHTS
#define MAX_LIGHTS 8
uniform int uNumberOfLights;
uniform vec3 uAmbientalColor;
uniform vec3 uLightPositions[MAX_LIGHTS];
uniform vec3 uLightColors[MAX_LIGHTS];
uniform float uLightIntensities[MAX_LIGHTS];
uniform float uAttenuationConstant[MAX_LIGHTS];
uniform float uAttenuationLinear[MAX_LIGHTS];
uniform float uAttenuationQuadratic[MAX_LIGHTS];

uniform vec3 uCameraPosition;
in vec3 vFragPosition;

uniform int uHasColor0;
in vec4 vColor0;

in vec3 vNormal;
in vec2 vTexCoord;
in vec2 vTexCoord1;
in vec4 vTangent;

out vec4 oColor;

void main() {
  // Base color
  vec4 color = uBaseColor;
  color.rgb *= uAmbientalColor;

  vec2 textureCoords = (uBaseColorTexCoord == 1) ? vTexCoord1 : vTexCoord;
  if (uHasBaseColorTexture == 1) {
    color *= texture(uTexture, textureCoords);
  }

  if (uHasColor0 == 1) {
    color *= vColor0;
  }

  if (uAlphaMode == 0) { // for opaque alpha mode
    color.a = 1.0;
  } else if (uAlphaMode == 1) { // for mask alpha mode
    if (color.a < uAlphaCutoff) {
      discard;
    }
  }
  
  textureCoords = (uMetallicRoughnessTexCoord == 1) ? vTexCoord1 : vTexCoord;
  // Metallic and roughness
  /*float metallic = uMetallicFactor;
  float roughness = uRoughnessFactor;
  if (uHasMetallicRoughnessTexture == 1) {
    vec4 mrTexture = texture(uMetallicRoughnessTexture, textureCoords);
    metallic = mrTexture.b * uMetallicFactor;  // Blue channel for metallic
    roughness = mrTexture.g * uRoughnessFactor;  // Green channel for roughness
  }*/

  // Normal mapping
  vec3 normal = normalize(vNormal);
  textureCoords = (uNormalTexCoord == 1) ? vTexCoord1 : vTexCoord;
  if (uHasNormalTexture == 1) {
    vec3 normalMap = texture(uNormalTexture, textureCoords).xyz * 2.0 - 1.0;
    normalMap.xy *= uNormalTextureScale;
    normal = normalize(normalMap);
  }

  vec3 fragPosition = vFragPosition;

  // View vector (assumed to be from camera position)
  vec3 V = normalize(uCameraPosition - fragPosition);

  // Initial material color
  vec3 finalColor = vec3(0.0);
  
  for (int i = 0; i < uNumberOfLights; i++) {
    vec3 lightPosition = uLightPositions[i];
    vec3 lightColor = uLightColors[i];
    float intensity = uLightIntensities[i];
    float constant = uAttenuationConstant[i];
    float linear = uAttenuationLinear[i];
    float quadratic = uAttenuationQuadratic[i];

    vec3 L = lightPosition - fragPosition;
    vec3 lightDir = normalize(L);
    float distance = length(L);

    // Adjusted Attenuation calculation
    float attenuation = 1.0 / (constant + linear * distance + quadratic * (distance * distance));

    // Lambertian Diffuse
    float diff = max(dot(normal, lightDir), 0.0);
    vec3 diffuse = (vec3(0.95) * uBaseColor.rgb * diff * intensity * attenuation) * 0.3;

    // (Blinn-)Phong Specular (only if using Phong shading)
    vec3 halfDir = normalize(lightDir + V);
    float spec = pow(max(dot(halfDir, normal), 0.0), 150.0);
    vec3 specular = vec3(0.95) * uBaseColor.rgb * spec * intensity;

    // Apply diffuse, specular, and attenuation
    finalColor += specular * (lightColor / pow(distance, 2.0));
  }

  finalColor += color.rgb;

  // Emissive component
  textureCoords = (uEmissiveTexCoord == 1) ? vTexCoord1 : vTexCoord;
  if (uHasEmissiveTexture == 1) {
    vec3 emissive = texture(uEmissiveTexture, textureCoords).rgb * uEmissiveFactor;
    finalColor += emissive;
  }

  // Occlusion map
  textureCoords = (uOcclusionTexCoord == 1) ? vTexCoord1 : vTexCoord;
  if (uHasOcclusionTexture == 1) {
    float occlusion = 1.0 + uOcclusionStrength * (texture(uOcclusionTexture, textureCoords).r - 1.0);
    finalColor = mix(finalColor, finalColor * occlusion, uOcclusionStrength);
  }
  
  finalColor = clamp(finalColor, 0.0, 1.0);
  oColor = vec4(finalColor, uBaseColor.a);
}`

const geoVertex = `#version 300 es
precision mediump float;

layout (location = 0) in vec3 aPosition;
layout (location = 1) in vec3 aNormal;
layout (location = 2) in vec2 aTexCoord;

uniform mat4 uMvpMatrix;
uniform mat4 uModelMatrix;

out vec3 vFragPosition;
out vec2 vTexCoord;
out vec3 vNormal;

void main() {
  gl_PointSize = 5.0;
  gl_Position = uMvpMatrix * vec4(aPosition, 1.0);
  vNormal = aNormal; //(uModelMatrix * vec4(aNormal, 0.0)).xyz;
  vTexCoord = aTexCoord;
  vFragPosition = (uModelMatrix * vec4(aPosition, 1.0)).xyz;
}`

const geoFragment = `#version 300 es
precision mediump float;

uniform vec4 uBaseColor;
uniform sampler2D uTexture;
uniform int uHasBaseColorTexture;

// LIGHTS
#define MAX_LIGHTS 8
uniform int uNumberOfLights;
uniform vec3 uAmbientalColor;
uniform vec3 uLightPositions[MAX_LIGHTS];
uniform vec3 uLightColors[MAX_LIGHTS];
uniform float uLightIntensities[MAX_LIGHTS];
uniform float uAttenuationConstant[MAX_LIGHTS];
uniform float uAttenuationLinear[MAX_LIGHTS];
uniform float uAttenuationQuadratic[MAX_LIGHTS];

// MATERIAL
uniform int uShadingModel;   // 0 = Lambert, 1 = Phong, 2 = Blinn-Phong
uniform vec3 uDiffuseColor;
uniform vec3 uSpecularColor;
uniform float uShininess;

uniform vec3 uCameraPosition;
in vec3 vFragPosition;

in vec2 vTexCoord;
in vec3 vNormal;

out vec4 oColor;

void main() {
  vec3 albedo = uBaseColor.rgb * uAmbientalColor;

  if (uHasBaseColorTexture == 1) {
    albedo *= texture(uTexture, vTexCoord).rgb;
  }

  vec3 normal = normalize(vNormal);
  vec3 viewDir = normalize(uCameraPosition - vFragPosition);

  vec3 finalColor = vec3(0.0);

  for (int i = 0; i < uNumberOfLights; i++) {
    vec3 lightPosition = uLightPositions[i];
    vec3 lightColor = uLightColors[i];
    float intensity = uLightIntensities[i];
    float constant = uAttenuationConstant[i];
    float linear = uAttenuationLinear[i];
    float quadratic = uAttenuationQuadratic[i];

    vec3 L = lightPosition - vFragPosition;
    vec3 lightDir = normalize(L);
    float distance = length(L);

    // Adjusted Attenuation calculation
    float attenuation = 1.0 / (constant + linear * distance + quadratic * (distance * distance));

    // Lambertian Diffuse
    float diff = max(dot(normal, lightDir), 0.0);
    //vec3 diffuse = lightColor * uBaseColor.rgb * diff * intensity * attenuation;
    vec3 diffuse = (uDiffuseColor * uBaseColor.rgb * diff * intensity * attenuation) * 0.3;

    // (Blinn-)Phong Specular (only if using Phong shading)
    vec3 specular = vec3(0.0);
    if (uShadingModel == 1) {
      //vec3 reflectDir = max(dot(lightDir, normal), 0.0); //reflect(lightDir, normal);
      vec3 R = 2.0 * max(dot(lightDir, normal), 0.0) * normal - lightDir;
      float spec = pow(max(dot(R, viewDir), 0.0), uShininess);
      specular = uSpecularColor * uBaseColor.rgb * spec * intensity * attenuation;
    } else if (uShadingModel == 2) {  // Blinn-Phong shading
      vec3 halfDir = normalize(lightDir + viewDir);
      float spec = pow(max(dot(halfDir, normal), 0.0), uShininess);
      specular = uSpecularColor * uBaseColor.rgb * spec * intensity;
    }

    // Apply diffuse, specular, and attenuation
    finalColor += (diffuse + specular) * (lightColor / pow(distance, 3.0));
  }

  finalColor += albedo;

  finalColor = clamp(finalColor, 0.0, 1.0);
  oColor = vec4(finalColor, uBaseColor.a);
}`

const axesVertex = `#version 300 es
precision mediump float;
in vec3 aPosition;
in vec3 aColor;
uniform mat4 uModelViewProjection;
out vec4 vColor;
void main() {
    gl_Position = uModelViewProjection * vec4(aPosition, 1);
    vColor = vec4(aColor, 0.7);
}`

const axesFragment = `#version 300 es
precision mediump float;
in vec4 vColor;
out vec4 oColor;
void main() {
  oColor = vColor;
}`

export const shaders = {
  axes: { vertex: axesVertex, fragment: axesFragment },
  geo: { vertex: geoVertex, fragment: geoFragment },
  gltf: { vertex: gltfVertex, fragment: gltfFragment }
}