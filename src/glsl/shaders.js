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
  gl_Position = uMvpMatrix * vec4(aPosition, 1.0);
  vNormal = aNormal;
  vTexCoord = aTexCoord;
  vTexCoord1 = aTexCoord1;
  vTangent = aTangent;
  vFragPosition = (uModelMatrix * vec4(aPosition, 1.0)).xyz;

  vColor0 = aColor0;
}`

//https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#appendix-b-brdf-implementation
const gltfFragment = `#version 300 es
precision mediump float;

uniform int uHasTexCoord1;

uniform vec4 uBaseColor;
uniform sampler2D uTexture;
uniform int uHasBaseColorTexture;

uniform sampler2D uNormalTexture;
uniform int uHasNormalTexture;
uniform float uNormalTextureScale;

uniform sampler2D uEmissiveTexture;
uniform int uHasEmissiveTexture;
uniform vec3 uEmissiveFactor;

uniform sampler2D uMetallicRoughnessTexture;
uniform int uHasMetallicRoughnessTexture;
uniform float uMetallicFactor;
uniform float uRoughnessFactor;

uniform sampler2D uOcclusionTexture;
uniform int uHasOcclusionTexture;
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

// Constants
const float M_PI = 3.141592653589793;

// Function prototypes (declarations)
float D(float alpha, vec3 N, vec3 H);
vec3 specular_brdf(float alpha, vec3 V, vec3 H, vec3 N);
vec3 diffuse_brdf(vec3 color);
vec3 conductor_fresnel(vec3 f0, vec3 bsdf, vec3 V, vec3 H);
vec3 fresnel_mix(float ior, vec3 base, vec3 layer, vec3 V, vec3 H);
float G(float alpha, vec3 N, vec3 V, vec3 L);
vec3 metal_brdf(float roughness, vec3 baseColor, vec3 V, vec3 H, vec3 N);
vec3 dielectric_brdf(vec3 baseColor, float roughness, vec3 V, vec3 H, vec3 N);
vec3 material(vec3 baseColor, float metallic, float roughness, vec3 V, vec3 L, vec3 N);

// Specular BRDF using GGX microfacet model
vec3 specular_brdf(float alpha, vec3 V, vec3 H, vec3 N) {
    return V * D(alpha, N, H);  // V is the view vector, N is the surface normal, H is the half vector
}

// Diffuse BRDF using Lambertian reflection
vec3 diffuse_brdf(vec3 color) {
    return (1.0 / M_PI) * color;
}

// Fresnel term for conductors (metallic materials)
vec3 conductor_fresnel(vec3 f0, vec3 bsdf, vec3 V, vec3 H) {
    return bsdf * (f0 + (1.0 - f0) * pow(1.0 - abs(dot(V, H)), 5.0));  // V is the view vector, H is the half vector
}

// Fresnel term for dielectrics (non-metallic materials)
vec3 fresnel_mix(float ior, vec3 base, vec3 layer, vec3 V, vec3 H) {
    float f0 = pow((1.0 - ior) / (1.0 + ior), 2.0);  // Calculate F0 from IOR
    float fr = f0 + (1.0 - f0) * pow(1.0 - abs(dot(V, H)), 5.0);
    return mix(base, layer, fr);
}

// GGX distribution function for the microfacet model
float D(float alpha, vec3 N, vec3 H) {
    float a2 = alpha * alpha;
    float NdotH = max(dot(N, H), 0.0);  // N is the surface normal, H is the half vector
    float NdotH2 = NdotH * NdotH;
    float denom = (NdotH2 * (a2 - 1.0) + 1.0);
    return a2 / (M_PI * denom * denom);
}

// Geometry function using Schlick-GGX approximation
float G(float alpha, vec3 N, vec3 V, vec3 L) {
    float NdotV = max(dot(N, V), 0.0);  // N is the surface normal, V is the view vector
    float NdotL = max(dot(N, L), 0.0);  // L is the light vector
    float k = alpha / 2.0;

    float ggx1 = NdotV / (NdotV * (1.0 - k) + k);
    float ggx2 = NdotL / (NdotL * (1.0 - k) + k);

    return ggx1 * ggx2;
}

// Metal BRDF
vec3 metal_brdf(float roughness, vec3 baseColor, vec3 V, vec3 H, vec3 N) {
    float alpha = roughness * roughness;
    vec3 F0 = baseColor.rgb;

    return specular_brdf(alpha, V, H, N) * (F0 + (1.0 - F0) * pow(1.0 - abs(dot(V, H)), 5.0));  // Schlick Fresnel approximation
}

// Dielectric BRDF
vec3 dielectric_brdf(vec3 baseColor, float roughness, vec3 V, vec3 H, vec3 N) {
    vec3 diffuse = diffuse_brdf(baseColor.rgb);  // Diffuse component
    float alpha = roughness * roughness;         // Roughness squared for specular BRDF
    vec3 specular = specular_brdf(alpha, V, H, N);

    return fresnel_mix(1.5, diffuse, specular, V, H);  // Dielectrics use fixed IOR = 1.5, F0 = 0.04
}

// Final material BRDF combining metal and dielectric
vec3 material(vec3 baseColor, float metallic, float roughness, vec3 V, vec3 L, vec3 N) {
    vec3 H = normalize(V + L);  // Half vector
    float alpha = roughness * roughness;  // Roughness squared
    vec3 c_diff = mix(baseColor.rgb, vec3(0.0), metallic);  // Diffuse color is black for metals
    vec3 f0 = mix(vec3(0.04), baseColor.rgb, metallic);     // Fresnel F0 for dielectrics is 0.04

    // Schlick Fresnel term
    vec3 F = f0 + (1.0 - f0) * pow(1.0 - abs(dot(V, H)), 5.0);  // Schlick's approximation

    // Diffuse and specular contributions
    vec3 f_diffuse = (1.0 - F) * (1.0 / M_PI) * c_diff;
    vec3 f_specular = F * D(alpha, N, H) * G(alpha, N, V, L) / (4.0 * abs(dot(N, V)) * abs(dot(N, L)));

    // Final BRDF, blending diffuse and specular based on metalness
    return f_diffuse + f_specular;
}

void main() {
  // Base color
  vec4 color = uBaseColor;
  color.rgb *= uAmbientalColor;

  if (uHasBaseColorTexture == 1) {
    color *= texture(uTexture, vTexCoord);
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
  
  vec2 textureCoords = (uHasTexCoord1 == 1) ? vTexCoord1 : vTexCoord;

  // Metallic and roughness
  float metallic = uMetallicFactor;
  float roughness = uRoughnessFactor;
  if (uHasMetallicRoughnessTexture == 1) {
    vec4 mrTexture = texture(uMetallicRoughnessTexture, textureCoords);
    metallic = mrTexture.b * uMetallicFactor;  // Blue channel for metallic
    roughness = mrTexture.g * uRoughnessFactor;  // Green channel for roughness
  }

  // Normal mapping
  vec3 normal = normalize(vNormal);
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

  // Process lights
  /*for (int i = 0; i < uNumberOfLights; i++) {
    vec3 L = normalize(uLightPositions[i] - fragPosition);  // Light direction
    vec3 H = normalize(V + L);  // Half vector
    float NdotL = max(dot(normal, L), 0.0);  // Diffuse term

    // Material BRDF
    vec3 brdfResult = material(color.rgb, metallic, roughness, V, L, normal);

    // Compute attenuation (distance-based light falloff)
    float distance = length(uLightPositions[i] - fragPosition); //vTangent.xyz);
    float attenuation = 1.0 / (uAttenuationConstant[i] + uAttenuationLinear[i] * distance + uAttenuationQuadratic[i] * (distance * distance));

    // Calculate light contribution (diffuse + specular)
    vec3 diffuse = brdfResult * NdotL * vec3(1.0, 1.0, 1.0);
    vec3 specular = brdfResult * NdotL * vec3(1.0, 1.0, 1.0);
    vec3 lightContribution = attenuation * (diffuse + specular);

    // Accumulate the light contribution
    finalColor += lightContribution;
  }
*/
  
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
    //finalColor += (diffuse + specular) * (lightColor / pow(distance, 3.0));
    finalColor += specular * (lightColor / pow(distance, 2.0));
  }

  finalColor += color.rgb;

  // Emissive component
  if (uHasEmissiveTexture == 1) {
    vec3 emissive = texture(uEmissiveTexture, textureCoords).rgb * uEmissiveFactor;
    finalColor += emissive;
  }

  // Occlusion map
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
  gl_Position = uMvpMatrix * vec4(aPosition, 1.0);
  vNormal = aNormal;
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