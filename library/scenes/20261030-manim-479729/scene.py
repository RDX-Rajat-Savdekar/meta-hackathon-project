class Seg(Scene):
    def construct(self):
        self.camera.background_color = BG
        root_p = UP * 5.0
        midL_p = LEFT * 2.2 + UP * 3.2
        midR_p = RIGHT * 2.2 + UP * 3.2
        leaf_ps = [LEFT * 3.0 + UP * 1.6, LEFT * 1.4 + UP * 1.6, RIGHT * 1.4 + UP * 1.6, RIGHT * 3.0 + UP * 1.6]

        l1 = Line(root_p, midL_p, color=FG, stroke_width=5, stroke_opacity=0.65)
        l2 = Line(root_p, midR_p, color=FG, stroke_width=5, stroke_opacity=0.65)
        l3 = Line(midL_p, leaf_ps[0], color=FG, stroke_width=4, stroke_opacity=0.6)
        l4 = Line(midL_p, leaf_ps[1], color=FG, stroke_width=4, stroke_opacity=0.6)
        l5 = Line(midR_p, leaf_ps[2], color=FG, stroke_width=4, stroke_opacity=0.6)
        l6 = Line(midR_p, leaf_ps[3], color=FG, stroke_width=4, stroke_opacity=0.6)
        lines = VGroup(l1, l2, l3, l4, l5, l6)

        root = Circle(radius=0.46, fill_color=ACCENT3, fill_opacity=1, stroke_color=FG, stroke_width=3).move_to(root_p)
        midL = Circle(radius=0.36, fill_color=GOOD, fill_opacity=1, stroke_color=FG, stroke_width=3).move_to(midL_p)
        midR = Circle(radius=0.36, fill_color=GOOD, fill_opacity=1, stroke_color=FG, stroke_width=3).move_to(midR_p)
        leaves = VGroup(*[Circle(radius=0.28, fill_color=ACCENT, fill_opacity=1, stroke_color=FG, stroke_width=3).move_to(p) for p in leaf_ps])
        mids = VGroup(midL, midR)

        root_lab = Text("n", font_size=40, color="#111111").move_to(root_p)
        mid_labs = VGroup(
            Text("n/2", font_size=40, color="#111111").move_to(midL_p),
            Text("n/2", font_size=40, color="#111111").move_to(midR_p),
        )
        tree = VGroup(lines, mids, leaves, root, root_lab, mid_labs)
        tree.scale(0.95)

        halo = Circle(radius=0.72, color=ACCENT3, stroke_width=8, fill_opacity=0).move_to(root_p)
        halo.set_stroke(opacity=0.9)

        highs = VGroup(*[
            Line(l.get_start(), l.get_end(), color=ACCENT3, stroke_width=10, stroke_opacity=0.95)
            for l in lines
        ])

        counter_pos = DOWN * 0.7
        counter_num = Text("0", font_size=64, color=GOOD).move_to(counter_pos)
        if counter_num.width > 7.5:
            counter_num.scale(7.5 / counter_num.width)
        counter_lab = Text("checks", font_size=40, color=FG).next_to(counter_num, DOWN, buff=0.12)
        counter_grp = VGroup(counter_num, counter_lab)

        big_pos = DOWN * 2.4
        huge = Text("25 TRILLION", font_size=72, color=MUTED).move_to(big_pos)
        if huge.width > 7.6:
            huge.scale(7.6 / huge.width)
        full = Text("25,000,000,000,000", font_size=40, color=MUTED).next_to(huge, UP, buff=0.08)
        big_grp = VGroup(huge, full)
        cross = Line(huge.get_left() + LEFT * 0.3 + UP * 0.25, huge.get_right() + RIGHT * 0.3 + DOWN * 0.25, color=ACCENT2, stroke_width=12)

        xs = [-2.4, -1.2, 0.0, 1.2, 2.4]
        hs = [0.5, 0.85, 1.2, 1.55, 1.9]
        base_y = 0.85
        bars = VGroup(*[
            Rectangle(width=0.78, height=h, fill_color=ACCENT, fill_opacity=0.95, stroke_width=2, stroke_color=FG).move_to([x, base_y + h / 2, 0])
            for x, h in zip(xs, hs)
        ])
        click_lab = Text("sorted", font_size=48, color=ACCENT).next_to(bars, UP, buff=0.2)

        t = 0.0
        self.play(FadeIn(tree, shift=DOWN * 0.3), FadeIn(halo, scale=1.4), run_time=1.6, rate_func=smooth)
        t += 1.6
        self.wait(1.9 - t)
        t = 1.9
        self.play(
            tree.animate.scale(0.92),
            halo.animate.scale(0.92).move_to(root_p * 0.92),
            LaggedStart(*[Create(h.copy()) for h in highs], lag_ratio=0.16),
            run_time=1.0, rate_func=smooth
        )
        t += 1.0
        self.wait(3.05 - t)
        t = 3.05
        self.play(FadeIn(counter_grp, shift=UP * 0.3), run_time=0.35, rate_func=smooth)
        t += 0.35
        cpos = counter_num.get_center().copy()

        def tick(m, alpha):
            v = int(alpha * 5000000)
            nt = Text(f"{v:,}", font_size=64, color=GOOD).move_to(cpos)
            if nt.width > 7.2:
                nt.scale(7.2 / nt.width)
            m.become(nt)

        self.play(UpdateFromAlphaFunc(counter_num, tick, rate_func=linear), run_time=0.95)
        t += 0.95
        self.wait(4.66 - t)
        t = 4.66
        self.play(GrowFromCenter(big_grp, rate_func=smooth), run_time=0.45)
        t += 0.45
        self.play(big_grp.animate.set_opacity(0.35), Create(cross), counter_grp.animate.scale(1.05), run_time=0.85, rate_func=smooth)
        t += 0.85
        self.wait(6.3 - t)
        t = 6.3
        leaf_to_bar = [bars[1], bars[2], bars[3], bars[4]]
        self.play(
            LaggedStart(*[ReplacementTransform(l.copy(), b) for l, b in zip(leaves, leaf_to_bar)], lag_ratio=0.15),
            FadeOut(leaves, shift=DOWN * 0.2),
            FadeIn(click_lab, shift=UP * 0.2),
            run_time=0.8, rate_func=smooth
        )
        t += 0.8
        self.play(Flash(bars.get_center(), color=ACCENT, line_length=0.28, num_lines=16), bars.animate.scale(1.04), run_time=0.47, rate_func=smooth)
        t += 0.47