precision mediump float;
varying vec2 vUv;
varying vec3 vPosition;
uniform float u_time;
uniform float u_grid_r;
uniform float u_grid_g;
uniform float u_grid_b;
uniform float u_bg_r;
uniform float u_bg_g;
uniform float u_bg_b;

// Grid parameters
const float GRID_SIZE = 6.0;
const float LINE_WIDTH = 0.075;
const float SCROLL_SPEED = 0.1;

float grid(vec2 uv) {
    vec2 grid_uv = fract(uv * GRID_SIZE);
    
    float horizontal = smoothstep(0.0, LINE_WIDTH, grid_uv.y) * 
                      smoothstep(LINE_WIDTH, 0.0, grid_uv.y - LINE_WIDTH);
    float vertical = smoothstep(0.0, LINE_WIDTH, grid_uv.x) * 
                    smoothstep(LINE_WIDTH, 0.0, grid_uv.x - LINE_WIDTH);
    
    return max(horizontal, vertical);
}

void main() {
    vec2 uv = vUv * 2.0 - 1.0; // Convert to range [-1, 1]
    
    vec2 grid_uv = vec2(uv.x, uv.y + u_time * SCROLL_SPEED);
    float grid_pattern = grid(grid_uv);
    
    float fade = smoothstep(0.0, 1.0, 1.0 - length(uv));

    vec3 grid_color = vec3(u_grid_r, u_grid_g, u_grid_b);
    vec3 bg_color = vec3(u_bg_r, u_bg_g, u_bg_b);
    vec3 color = mix(bg_color, grid_color, grid_pattern) * fade;

    float alpha = max(grid_pattern * fade * 0.8, (1.0 - grid_pattern) * fade * 0.3);

    gl_FragColor = vec4(color, alpha);
}