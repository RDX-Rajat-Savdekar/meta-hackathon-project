from reelgen.audio.align import align_to_script
from reelgen.graph import offset_words
from reelgen.models import SegmentAudio, WordTiming


def test_matches_and_interpolates_unrecognised_words():
    heard = [WordTiming(word="Quick", start=0.0, end=0.4), WordTiming(word="pivot", start=1.0, end=1.4)]
    out = align_to_script("Quick sort's pivot!", heard, duration=2.0)
    assert [x.word for x in out] == ["Quick", "sort's", "pivot!"]
    assert out[0].start == 0.0 and out[2].start == 1.0
    assert 0.4 <= out[1].start < out[1].end <= 1.0


def test_trailing_words_spread_to_duration():
    out = align_to_script("a b c", [WordTiming(word="a", start=0, end=0.5)], duration=1.5)
    assert out[-1].end == 1.5
    assert all(x.start <= y.start for x, y in zip(out, out[1:]))


def test_offset_words_shifts_by_previous_durations(tmp_path):
    seg = lambda i, d: SegmentAudio(index=i, wav=tmp_path / "x.wav", duration=d, words=[WordTiming(word="w", start=0.5, end=0.7)])
    out = offset_words([seg(0, 2.0), seg(1, 3.0)])
    assert [x.start for x in out] == [0.5, 2.5]
