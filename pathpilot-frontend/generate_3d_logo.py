import math
from PIL import Image, ImageDraw, ImageFilter

def create_3d_glowing_logo(size=512):
    # Create high-res image with transparent background
    scale = 2  # Super-sample for razor sharpness
    w = size * scale
    h = size * scale
    
    # 1. Base glow canvas (black transparent)
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    glow_layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow_layer)
    
    center_x = w // 2
    center_y = h // 2
    
    # Coordinates for 3D Isometric 'V' Vertex Chevron
    # Top Left, Top Right, Center Vertex Point, Inner Apex
    tl_outer = (center_x - 300, center_y - 240)
    tl_inner = (center_x - 140, center_y - 240)
    
    tr_outer = (center_x + 300, center_y - 240)
    tr_inner = (center_x + 140, center_y - 240)
    
    bottom_vertex = (center_x, center_y + 280)
    bottom_inner = (center_x, center_y + 60)
    
    # Draw deep volumetric glow blobs around the vertex and arms
    glow_draw.ellipse([center_x - 220, center_y - 120, center_x + 220, center_y + 320], fill=(85, 211, 154, 110))
    glow_draw.ellipse([center_x - 120, center_y - 40, center_x + 120, center_y + 200], fill=(195, 245, 60, 160))
    glow_draw.ellipse([center_x - 50, center_y + 20, center_x + 50, center_y + 120], fill=(255, 255, 255, 200))
    
    # Blur the glow layer heavily
    glow_layer = glow_layer.filter(ImageFilter.GaussianBlur(60 * scale))
    
    # 2. Main 3D faceted geometry
    geom_layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(geom_layer)
    
    # Facet A: Left Wing Front Face (Deep obsidian emerald)
    left_front = [
        tl_outer,
        (tl_outer[0] + 60, tl_outer[1] + 30),
        bottom_vertex,
        (bottom_vertex[0] - 50, bottom_vertex[1] - 40)
    ]
    draw.polygon(left_front, fill=(6, 78, 59, 255))
    
    # Facet B: Left Wing Main Plane (Electric emerald gradient simulation)
    left_main = [
        tl_outer,
        tl_inner,
        bottom_inner,
        bottom_vertex
    ]
    draw.polygon(left_main, fill=(16, 185, 129, 255))
    
    # Facet C: Right Wing Main Plane (Bright Cyber Lime / Mint)
    right_main = [
        tr_outer,
        tr_inner,
        bottom_inner,
        bottom_vertex
    ]
    draw.polygon(right_main, fill=(85, 211, 154, 255))
    
    # Facet D: Top Bevel Caps (3D Depth perspective)
    left_top_cap = [
        (tl_outer[0], tl_outer[1]),
        (tl_outer[0] + 40, tl_outer[1] - 30),
        (tl_inner[0] + 40, tl_inner[1] - 30),
        (tl_inner[0], tl_inner[1])
    ]
    draw.polygon(left_top_cap, fill=(195, 245, 60, 255))
    
    right_top_cap = [
        (tr_inner[0], tr_inner[1]),
        (tr_inner[0] - 40, tr_inner[1] - 30),
        (tr_outer[0] - 40, tr_outer[1] - 30),
        (tr_outer[0], tr_outer[1])
    ]
    draw.polygon(right_top_cap, fill=(225, 255, 160, 255))
    
    # Facet E: Right Specular Edge Chamfer
    right_bevel = [
        (tr_outer[0], tr_outer[1]),
        (tr_outer[0] - 40, tr_outer[1] - 30),
        (bottom_vertex[0] + 30, bottom_vertex[1] - 20),
        bottom_vertex
    ]
    draw.polygon(right_bevel, fill=(195, 245, 60, 240))
    
    # Facet F: Center Glowing Vertex Crystal (floating neon core)
    core_pts = [
        (center_x, bottom_inner[1] - 80),
        (center_x + 60, bottom_inner[1] + 10),
        (center_x, bottom_inner[1] + 100),
        (center_x - 60, bottom_inner[1] + 10)
    ]
    draw.polygon(core_pts, fill=(240, 255, 230, 255))
    
    # Sharp neon edge strokes
    draw.line([tl_outer, bottom_vertex], fill=(52, 211, 153, 255), width=6 * scale)
    draw.line([bottom_vertex, tr_outer], fill=(195, 245, 60, 255), width=8 * scale)
    draw.line([tl_inner, bottom_inner, tr_inner], fill=(255, 255, 255, 220), width=4 * scale)
    draw.line([core_pts[0], core_pts[1], core_pts[2], core_pts[3], core_pts[0]], fill=(255, 255, 255, 255), width=3 * scale)

    # Composite layers: glow behind geometry
    composite = Image.alpha_composite(glow_layer, geom_layer)
    
    # Resize down with high quality Lanczos anti-aliasing
    final_img = composite.resize((size, size), Image.Resampling.LANCZOS)
    return final_img

if __name__ == "__main__":
    logo = create_3d_glowing_logo(512)
    
    logo.save("pathpilot-frontend/src/assets/logo.png", "PNG")
    logo.save("pathpilot-frontend/public/logo.png", "PNG")
    print("Successfully generated high-res 3D glowing logo!")
