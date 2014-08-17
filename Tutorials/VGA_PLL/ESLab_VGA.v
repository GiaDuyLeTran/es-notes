module ESLab_VGA(

	CLOCK_50,
	
	VGA_B,
	VGA_BLANK_N,
	VGA_CLK,
	VGA_G,
	VGA_HS,
	VGA_R,
	VGA_SYNC_N,
	VGA_VS,

	SW,
	
	);

input 						CLOCK_50;
	
output		  [7:0]		VGA_B;
output		        		VGA_BLANK_N;
output 		        		VGA_CLK;
output		  [7:0]		VGA_G;
output	         		VGA_HS;
output	     [7:0]		VGA_R;
output	         		VGA_SYNC_N;
output		        		VGA_VS;

input			  [17:0]		SW;

vga_pll pll(.inclk0(CLOCK_50), .c0(VGA_CLK));

wire [11:0] CounterX;
wire [11:0] CounterY;
vga_time_generator vga0(
	.pixel_clk(VGA_CLK),
	.h_disp   (1280),
	.h_fporch (48),
	.h_sync   (112), 
	.h_bporch (248),
	.v_disp   (1024),
	.v_fporch (1),
	.v_sync   (3),
	.v_bporch (38),
	.vga_hs   (VGA_HS),
	.vga_vs   (VGA_VS),
	.vga_blank(VGA_BLANK_N),
	.CounterY(CounterY),
	.CounterX(CounterX) 
);

assign VGA_SYNC_N = 1;

wire [7:0] red;
wire [7:0] green;
wire [7:0] blue;

assign red = CounterX * CounterX - CounterY * CounterY * CounterY;
assign green = (CounterX | CounterY)/(CounterX ^ CounterY) * (CounterX & CounterY + CounterX * CounterY);
assign blue = (3 * CounterX / (red - green));

assign VGA_R = VGA_BLANK_N && SW[0] ? red : 10'h000;
assign VGA_G = VGA_BLANK_N && SW[1] ? green : 10'h000;
assign VGA_B = VGA_BLANK_N && SW[2] ? blue : 10'h000;

endmodule
