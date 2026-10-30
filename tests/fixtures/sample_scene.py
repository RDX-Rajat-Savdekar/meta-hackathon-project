class Seg(Scene):
    def construct(self):
        title = Text("Binary search", font_size=72, color=ACCENT, weight=BOLD).move_to(UP * 5)
        self.play(Write(title), run_time=1)
        cells = VGroup(*[Square(0.95, color=FG).add(Text(str(v), font_size=36, color=FG)) for v in [1, 3, 5, 7, 9, 11, 13]])
        cells.arrange(RIGHT, buff=0.08).move_to(UP * 1.5)
        self.play(FadeIn(cells, shift=UP), run_time=0.8)
        mid = cells[3]
        self.play(mid.animate.set_fill(ACCENT2, opacity=0.8), run_time=0.6)
        self.play(cells[:3].animate.set_opacity(0.2), run_time=0.6)
        self.wait(1)
