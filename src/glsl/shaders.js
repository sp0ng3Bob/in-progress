const vertex = `#version 300 es
precision mediump float;

layout (location = 0) in vec3 aPosition; //vec3 aPosition
layout (location = 1) in vec2 aTexCoord;
layout (location = 2) in vec3 aNormal;

/* SKINNING */
layout (location = 3) in vec4 aJoint0;
layout (location = 5) in vec4 aWeight0;
layout (location = 4) in vec4 aJoint1;
layout (location = 6) in vec4 aWeight1;

layout (location = 7) in vec4 aTangent;

uniform mat4 uMvpMatrix;

/*uniform JointMatrix
{
    mat4 matrix[65];
} u_jointMatrix;*/

out vec3 vNormal;
out vec2 vTexCoord;
out vec4 vTangent;

void main() {
  mat4 skinMatrix = mat4(1.0); // Default to identity matrix

  /*if (aWeight0 != vec4(0.0)) {
      skinMatrix = aWeight0.x * u_jointMatrix.matrix[int(aJoint0.x)] +
                    aWeight0.y * u_jointMatrix.matrix[int(aJoint0.y)] +
                    aWeight0.z * u_jointMatrix.matrix[int(aJoint0.z)] +
                    aWeight0.w * u_jointMatrix.matrix[int(aJoint0.w)];
  }

  if (aWeight1 != vec4(0.0)) {
      skinMatrix += aWeight1.x * u_jointMatrix.matrix[int(aJoint1.x)] +
                    aWeight1.y * u_jointMatrix.matrix[int(aJoint1.y)] +
                    aWeight1.z * u_jointMatrix.matrix[int(aJoint1.z)] +
                    aWeight1.w * u_jointMatrix.matrix[int(aJoint1.w)];
  }*/

  gl_Position = uMvpMatrix * skinMatrix * vec4(aPosition, 1.0);

  if (aNormal != vec3(0.0)) {
      vec3 transformedNormal = mat3(transpose(inverse(skinMatrix))) * aNormal;
      vNormal = (uMvpMatrix * vec4(transformedNormal, 0.0)).xyz;
  } else {
      vNormal = vec3(0.0); // Default normal if not defined
  }
  //gl_Position = uMvpMatrix * aPosition; //vec4(aPosition, 1.0);
  //vNormal = (uMvpMatrix * aNormal).xyz;
  vTexCoord = aTexCoord;
  vTangent = aTangent;
}
`

//https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#appendix-b-brdf-implementation
const fragment = `#version 300 es
precision mediump float;

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
uniform float uMetallic;
uniform float uMetallicFactor;
uniform float uRoughness;
uniform float uRoughnessFactor;

uniform sampler2D uOcclusionTexture;
uniform int uHasOcclusionTexture;
uniform float uOcclusionStrength;

// LIGHTS
#define MAX_LIGHTS 8
uniform int uNumberOfLights;
uniform vec3 uLightPositions[MAX_LIGHTS]; //uNumberOfLights]
uniform vec3 uLightColors[MAX_LIGHTS]; //uNumberOfLights]
uniform vec3 uDiffuseColor[MAX_LIGHTS]; //= vec3(200, 200, 180)
uniform vec3 uSpecularColor[MAX_LIGHTS];  // Material specular color
uniform vec3 uAmbientalColor[MAX_LIGHTS];  // Material ambient color
uniform float uShininess[MAX_LIGHTS];  // Material shininess
uniform float uAttenuation[MAX_LIGHTS];  // Material shininess

in vec3 vNormal;
in vec2 vTexCoord;
in vec4 vTangent;

out vec4 oColor;

// BRDF functions
vec3 F_Schlick(float cosTheta, vec3 F0) {
    return F0 + (1.0 - F0) * pow(1.0 - cosTheta, 5.0);
}

float DistributionGGX(vec3 N, vec3 H, float roughness) {
    float a = roughness * roughness;
    float a2 = a * a;
    float NdotH = max(dot(N, H), 0.0);
    float NdotH2 = NdotH * NdotH;

    float nom = a2;
    float denom = (NdotH2 * (a2 - 1.0) + 1.0);
    denom = 3.14159265359 * denom * denom;

    return nom / denom;
}

float GeometrySchlickGGX(float NdotV, float roughness) {
    float r = (roughness + 1.0);
    float k = (r * r) / 8.0;

    float nom = NdotV;
    float denom = NdotV * (1.0 - k) + k;

    return nom / denom;
}

float GeometrySmith(vec3 N, vec3 V, vec3 L, float roughness) {
    float NdotV = max(dot(N, V), 0.0);
    float NdotL = max(dot(N, L), 0.0);
    float ggx2 = GeometrySchlickGGX(NdotV, roughness);
    float ggx1 = GeometrySchlickGGX(NdotL, roughness);
    
    return ggx1 * ggx2;
    }
    // BRDF - end
    /*
    //THIS!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        vec3 N = normalize(vNormal);
        vec3 V = normalize(uCameraPosition - vPosition);
        vec4 baseColor = texture(uBaseColorTexture, vTexCoord) * uBaseColor;
        vec3 albedo = baseColor.rgb;
        float alpha = baseColor.a;
    
        vec4 metallicRoughness = texture(uMetallicRoughnessTexture, vTexCoord);
        float metallic = metallicRoughness.b * uMetallic;
        float roughness = metallicRoughness.g * uRoughness;
    
        vec3 F0 = vec3(0.04);
        F0 = mix(F0, albedo, metallic);
    
        vec3 ambient = vec3(0.03) * albedo;
        vec3 color = ambient;
    
        for (int i = 0; i < 4; ++i) {
            vec3 L = normalize(uLightPositions[i] - vPosition);
            vec3 H = normalize(V + L);
    
            vec3 F = F_Schlick(max(dot(H, V), 0.0), F0);
            float D = DistributionGGX(N, H, roughness);
            float G = GeometrySmith(N, V, L, roughness);
    
            vec3 kS = F;
            vec3 kD = vec3(1.0) - kS;
            kD *= 1.0 - metallic;
    
            float NdotL = max(dot(N, L), 0.0);
    
            vec3 numerator = D * G * F;
            float denominator = 4.0 * max(dot(N, V), 0.0) * NdotL + 0.001;
            vec3 specular = numerator / denominator;
    
            color += (kD * albedo / 3.14159265359 + specular) * NdotL * uLightColors[i];
        }
    
        fragColor = vec4(color, alpha);
    */

void main() {
/*
vec4 baseColor = hasBaseColorTexture == 1 ? texture(uBaseColorTexture, vTexCoord) * uBaseColor : uBaseColor;
    vec3 albedo = baseColor.rgb;
    float alpha = baseColor.a;

    vec4 metallicRoughness = hasMetallicRoughnessTexture == 1 ? texture(uMetallicRoughnessTexture, vTexCoord) : vec4(uMetallic, uRoughness, 0.0, 0.0);
    float metallic = metallicRoughness.b;
    float roughness = metallicRoughness.g;
*/

    /*vec3 baseColor = uBaseColor.rgb; //vec3(1.0);
    float baseAlpha = uBaseColor.a;
    float textureAlpha = 1.0;
    if (uHasBaseColorTexture == 1) {
      vec4 texture = texture(uTexture, vTexCoord);
      vec3 textureColor = texture.rgb;
      textureAlpha = texture.a;
      baseColor = mix(baseColor, textureColor, 0.5);
    }

    /*vec3 normal = normalize(vNormal);
    if (uHasNormalTexture == 1) {
        vec3 tangentNormal = texture(uNormalTexture, vTexCoord).xyz * 2.0 - 1.0;
        tangentNormal.xy *= uNormalTextureScale;
        mat3 tbn = mat3(vTangent.xyz, cross(vNormal, vTangent.xyz), vNormal);
        normal = normalize(tbn * tangentNormal);
    }/
  vec3 normal = normalize(vNormal);
  if (uHasNormalTexture == 1) {
      normal = normalize(texture(uNormalTexture, vTexCoord).xyz * 2.0 - 1.0);
      normal = mix(normal, vNormal, 1.0 - uNormalTextureScale);
  }

    vec3 emissive = vec3(0.0);
    if (uHasEmissiveTexture == 1) {
        emissive = texture(uEmissiveTexture, vTexCoord).rgb * uEmissiveFactor;
    }

    float metallic = uMetallicFactor * uMetallic;
    float roughness = uRoughnessFactor * uRoughness;
    if (uHasMetallicRoughnessTexture == 1) {
        vec4 metallicRoughness = texture(uMetallicRoughnessTexture, vTexCoord);
        metallic *= metallicRoughness.b;
        roughness *= metallicRoughness.g;
    }

    float occlusion = 1.0;
    if (uHasOcclusionTexture == 1) {
        occlusion = texture(uOcclusionTexture, vTexCoord).r * uOcclusionStrength;
    }

    vec3 ambient = vec3(0.0);
    vec3 diffuse = vec3(0.0);
    vec3 specular = vec3(0.0);

    for (int i = 0; i < uNumberOfLights; i++) {
        vec3 lightPos = uLightPositions[i];
        vec3 lightColor = uLightColors[i];
        vec3 diffuseColor = uDiffuseColor[i];
        vec3 specularColor = uSpecularColor[i];
        vec3 ambientalColor = uAmbientalColor[i];
        float shininess = uShininess[i];
        float attenuation = uAttenuation[i];

        vec3 lightDir = normalize(lightPos - vTangent.xyz);
        float diff = max(dot(normal, lightDir), 0.0);
        vec3 reflectDir = reflect(-lightDir, normal);
        vec3 viewDir = normalize(-vTangent.xyz);
        float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);

        ambient += ambientalColor * lightColor;
        diffuse += diff * diffuseColor * lightColor;
        specular += spec * specularColor * lightColor;
    }

    vec3 color = ambient + diffuse + specular + emissive;
    color = color * baseColor * occlusion;
    float combinedAlpha = mix(baseAlpha, textureAlpha, 0.5);
    oColor = vec4(color, combinedAlpha);*/

  vec4 albedo = texture(uTexture, vTexCoord);
  vec3 normal = normalize(vNormal);
  
  // Lambertian reflection (diffuse reflection)
  vec3 diffuse = vec3(0.0);
  
  for (int i = 0; i < uNumberOfLights; i++) {
    vec3 lightDir = normalize(uLightPositions[i] - vec3(vTexCoord, 0.0));
    float lambertian = max(dot(normal, lightDir), 0.0);
    diffuse += uLightColors[i] * uDiffuseColor[i] * lambertian + uAmbientalColor[i];
  }
  
  vec3 finalColor = mix(albedo.rgb * diffuse, uBaseColor.rgb, 0.1);
  oColor = vec4(finalColor, mix(albedo.a, uBaseColor.a, 0.1));
  
  
  
  
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
