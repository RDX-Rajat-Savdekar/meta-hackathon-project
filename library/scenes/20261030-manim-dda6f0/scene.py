class Seg(Scene):
    def construct(self):
        self.camera.background_color = BG
        t = 0.0
        spring = lambda tt: 4 * tt - 3 * tt * tt
        track_y = 2.0
        slot_x = [-2.8, -1.4, 0.0, 1.4, 2.8]
        values = [4, 1, 5, 3, 2]
        hs = [0.6 + 0.5 * v for v in values]

        def mkcap(a, b=None):
            if b is None:
                g = VGroup(Text(a, font_size=58, color=FG))
            else:
                g = VGroup(Text(a, font_size=56, color=FG), Text(b, font_size=56, color=FG)).arrange(DOWN, buff=0.12)
            if g.width > 7.4:
                g.scale(7.4 / g.width)
            g.move_to([0, 5.7, 0])
            return g

        cap0 = mkcap("five numbers")
        cap1 = mkcap("pick 3 pivot")
        cap2 = mkcap("sweep once")
        cap3 = mkcap("smaller left", "bigger right")
        cap4 = mkcap("two tiny", "piles")
        cap5 = mkcap("recurse each", "pile")
        cap6 = mkcap("each level", "touches once")
        cap7 = mkcap("random pivot", "splits half")
        cap8 = mkcap("log levels", "-> 1")

        track = Line([-3.6, track_y, 0], [3.6, track_y, 0], color=MUTED, stroke_width=7)

        bars = []
        for i, v in enumerate(values):
            h = hs[i]
            rect = RoundedRectangle(corner_radius=0.12, width=0.9, height=h, fill_color=FG, fill_opacity=0.92, stroke_color=FG, stroke_width=2)
            rect.move_to([slot_x[i], track_y + h / 2, 0])
            lab = Text(str(v), font_size=44, color=BG).move_to(rect.get_center() + [0, 0.1, 0])
            g = VGroup(rect, lab)
            bars.append(g)
        targets0 = [b.get_center().copy() for b in bars]
        for k, b in enumerate(bars):
            b.move_to([-7.0 + k * 0.5, track_y + 1.0, 0])

        pivot = bars[3]
        other5 = bars[2]
        h3 = hs[3]
        h5 = hs[2]
        glow = RoundedRectangle(corner_radius=0.18, width=1.15, height=h3 + 0.35, fill_color=ACCENT3, fill_opacity=0.28, stroke_color=ACCENT3, stroke_width=3)
        glow.move_to([0.0, track_y + h3 / 2 + 0.35, 0])

        scan = Rectangle(width=0.12, height=3.9, fill_color=FG, fill_opacity=0.9, stroke_width=0)
        scan.move_to([-3.6, track_y + 1.6, 0])

        bl1 = Line([0, track_y, 0], [-1.7, -0.9, 0], color=MUTED, stroke_width=4)
        bl2 = Line([0, track_y, 0], [1.7, -0.9, 0], color=MUTED, stroke_width=4)
        left_box = RoundedRectangle(corner_radius=0.18, width=1.9, height=0.9, fill_color=GOOD, fill_opacity=0.22, stroke_color=GOOD, stroke_width=3)
        left_box.move_to([-1.7, -1.55, 0])
        left_lab = Text("1, 2", font_size=48, color=FG).move_to(left_box.get_center())
        left_pile = VGroup(left_box, left_lab)
        right_box = RoundedRectangle(corner_radius=0.18, width=1.9, height=0.9, fill_color=ACCENT, fill_opacity=0.22, stroke_color=ACCENT, stroke_width=3)
        right_box.move_to([1.7, -1.55, 0])
        right_lab = Text("4, 5", font_size=48, color=FG).move_to(right_box.get_center())
        right_pile = VGroup(right_box, right_lab)

        miniL = Dot(point=[-2.05, -1.55, 0], radius=0.17, color=ACCENT2)
        miniL2 = Dot(point=[-1.35, -1.55, 0], radius=0.12, color=FG)
        miniR = Dot(point=[2.05, -1.55, 0], radius=0.17, color=ACCENT2)
        miniR2 = Dot(point=[1.35, -1.55, 0], radius=0.12, color=FG)

        band = Rectangle(width=7.8, height=4.1, fill_color=ACCENT2, fill_opacity=0.20, stroke_width=0)
        band.move_to([0, track_y + 1.45, 0])

        beam = Line([-1.7, -3.0, 0], [1.7, -3.0, 0], color=FG, stroke_width=6)
        ful = Triangle(fill_color=MUTED, fill_opacity=1, stroke_width=0).scale(0.22).move_to([0, -3.35, 0])
        half_lab = Text("half-half", font_size=36, color=MUTED).move_to([0, -2.45, 0])
        scaleG = VGroup(beam, ful, half_lab)
        shuf = Dot(point=[-1.7, -1.55, 0], radius=0.20, color=ACCENT3)

        d1 = RoundedRectangle(corner_radius=0.08, width=1.1, height=0.32, fill_color=ACCENT, fill_opacity=0.7, stroke_width=0).move_to([0, 0, 0])
        d2 = RoundedRectangle(corner_radius=0.08, width=0.75, height=0.26, fill_color=ACCENT, fill_opacity=0.55, stroke_width=0).move_to([0, -0.45, 0])
        d3 = RoundedRectangle(corner_radius=0.08, width=0.42, height=0.20, fill_color=GOOD, fill_opacity=0.8, stroke_width=0).move_to([0, -0.85, 0])
        depth = VGroup(mkcap("log levels", "-> 1"), VGroup(d1, d2, d3))
        depth.arrange(DOWN, buff=0.2)
        depth.scale(0.85)
        if depth.width > 3.2:
            depth.scale(3.2 / depth.width)
        depth.move_to([2.2, -2.7, 0])

        # beat 0 Say - slide in
        self.play(Create(track), LaggedStart(*[b.animate.move_to(tg) for b, tg in zip(bars, targets0)], lag_ratio=0.18), FadeIn(cap0, shift=UP * 0.2), run_time=3.4, rate_func=smooth)
        t += 3.4
        self.wait(4.14 - t)
        t = 4.14
        # beat 1 Pick - pivot to center + glow
        self.play(pivot.animate.move_to([0.0, track_y + h3 / 2 + 0.35, 0]), other5.animate.move_to([1.4, track_y + h5 / 2, 0]), pivot[0].animate.set_fill(ACCENT3, opacity=0.95).set_stroke(ACCENT3, width=3), GrowFromCenter(glow), FadeOut(cap0), FadeIn(cap1), run_time=1.0, rate_func=smooth)
        t += 1.0
        self.wait(5.66 - t)
        t = 5.66
        # beat 2 Sweep - scan line
        self.play(scan.animate.move_to([3.6, track_y + 1.6, 0]), LaggedStart(*[Indicate(b, color=ACCENT3, scale_factor=1.08) for b in bars], lag_ratio=0.18), FadeOut(cap1), FadeIn(cap2), run_time=2.0, rate_func=smooth)
        t += 2.0
        self.wait(8.04 - t)
        t = 8.04
        # beat 3 bigger - partition snap
        b4 = bars[0]; b1 = bars[1]; b5 = bars[2]; b3 = pivot; b2 = bars[4]
        h1 = hs[1]; h2 = hs[4]; h4 = hs[0]
        self.play(b1.animate.move_to([-2.8, track_y + h1 / 2, 0]), b2.animate.move_to([-1.4, track_y + h2 / 2, 0]), b3.animate.move_to([0.0, track_y + h3 / 2 + 0.35, 0]), b4.animate.move_to([1.4, track_y + h4 / 2, 0]), b5.animate.move_to([2.8, track_y + h5 / 2, 0]), b1[0].animate.set_fill(GOOD, opacity=0.92).set_stroke(GOOD, width=2), b2[0].animate.set_fill(GOOD, opacity=0.92).set_stroke(GOOD, width=2), b4[0].animate.set_fill(ACCENT, opacity=0.92).set_stroke(ACCENT, width=2), b5[0].animate.set_fill(ACCENT, opacity=0.92).set_stroke(ACCENT, width=2), FadeOut(scan), FadeOut(cap2), FadeIn(cap3), run_time=2.6, rate_func=spring)
        t += 2.6
        self.wait(11.42 - t)
        t = 11.42
        # beat 4 tiny - branches + piles
        self.play(Create(bl1), Create(bl2), FadeIn(left_pile, shift=DOWN * 0.2), FadeIn(right_pile, shift=DOWN * 0.2), FadeOut(cap3), FadeIn(cap4), run_time=2.4, rate_func=smooth)
        t += 2.4
        self.wait(14.6 - t)
        t = 14.6
        # beat 5 Recurse - pulse + mini pivots
        self.play(Indicate(left_pile, color=GOOD, scale_factor=1.12), Indicate(right_pile, color=ACCENT, scale_factor=1.12), FadeIn(miniL, scale=0.3), FadeIn(miniR, scale=0.3), FadeIn(miniL2), FadeIn(miniR2), FadeOut(cap4), FadeIn(cap5), run_time=1.8, rate_func=smooth)
        t += 1.8
        self.wait(17.36 - t)
        t = 17.36
        # beat 6 Each - level band wash
        self.play(FadeIn(band), LaggedStart(*[Indicate(b, color=ACCENT2, scale_factor=1.06) for b in bars], lag_ratio=0.15), FadeOut(cap5), FadeIn(cap6), run_time=1.6, rate_func=smooth)
        t += 1.6
        self.wait(19.66 - t)
        t = 19.66
        # beat 7 random - shuffle + scale wobble
        self.play(FadeIn(scaleG, shift=UP * 0.2), FadeIn(shuf), FadeOut(band), FadeOut(cap6), FadeIn(cap7), run_time=1.0, rate_func=smooth)
        t += 1.0
        self.play(shuf.animate.move_to([1.7, -1.55, 0]), Wiggle(beam, scale_value=1.15, rotation_angle=0.12 * 3.14159 / 180 * 10), run_time=1.0, rate_func=smooth)
        t += 1.0
        self.play(shuf.animate.move_to([-1.7, -1.55, 0]), Wiggle(beam, scale_value=1.15, rotation_angle=-0.12 * 3.14159 / 180 * 10), run_time=1.0, rate_func=smooth)
        t += 1.0
        self.wait(23.54 - t)
        t = 23.54
        # beat 8 log - depth indicator
        self.play(FadeIn(depth, shift=LEFT * 0.3), FadeOut(cap7), FadeIn(cap8), Indicate(depth, color=ACCENT, scale_factor=1.05), run_time=1.27, rate_func=smooth)
        t += 1.27
        self.wait(25.41 - t)