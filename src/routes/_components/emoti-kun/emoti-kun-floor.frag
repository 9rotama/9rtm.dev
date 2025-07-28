precision mediump float;
varying vec2 vUv;
varying vec3 vPosition;
uniform float u_time;

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
    vec3 base_color = vec3(124, 86, 160) / 255.0; // Base color
    
    vec3 color = vec3(base_color * grid_pattern * fade);
    
    float alpha = grid_pattern * fade * 0.8;
    
    gl_FragColor = vec4(color, alpha);
}