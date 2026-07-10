import React from 'react';
import { Helmet } from 'react-helmet-async';
import LoopTunnel from './LoopTunnel';
import './HowItWorks.css';

function HowItWorks() {
  return (
    <>
      <Helmet>
        <title>How It Works — Enactive</title>
        <meta
          name="description"
          content="Enactive identifies the open loops draining your attention and closes them through first-principles questioning. This is how it works."
        />
        <meta property="og:title" content="How It Works — Enactive" />
        <meta
          property="og:description"
          content="Enactive identifies the open loops draining your attention and closes them through first-principles questioning. This is how it works."
        />
        <meta property="og:url" content="https://theenactive.com/howitworks" />
        <link rel="canonical" href="https://theenactive.com/howitworks" />
      </Helmet>

      <div className="hiw-page">
        <LoopTunnel loopCount={8} />

        {/* ── Hero ── */}
        <section className="hiw-hero">
          <div className="hiw-container">
            <span className="section-eyebrow">How It Works</span>
            <h1>We don't ask how you feel about it. We ask what's causing it.</h1>
            <span className="tunnel-mono-hint" aria-hidden="true">SCROLL — EIGHT LOOPS BETWEEN HERE AND THE ANSWER ↓</span>
          </div>
        </section>

        <div className="tunnel-spacer" aria-hidden="true" />

        {/* ── Opening story ── */}
        <section className="hiw-story">
          <div className="hiw-container">
            <div className="tunnel-panel hiw-panel">
              <div className="hiw-prose">
                <p>
                  A friend was at my place a while back. Something was off the moment he walked in.
                  Small digs at how I run my life. Nothing direct, just pressure leaking out sideways.
                  I asked twice if something was going on? Nothing. So when he got up to leave, I let him.
                </p>
                <p>He made it to the door and couldn't walk through it. Came back and said, can I tell you what's going on?</p>
                <p>
                  We talked while I cooked. I didn't ask him how he felt. I asked what was causing it.
                  Then I asked what was causing that. We kept going until the answers stopped being feelings
                  and started being facts.
                </p>
                <p>
                  He was carrying four unfinished things at once. Pressure from his partner. Anxiety from another
                  situation he'd been avoiding. The weight of almost walking out. And the situation itself,
                  sitting on top of all of it.
                </p>
                <p>
                  Underneath all four was one thing he'd never looked at: a rule about commitment he'd inherited
                  from where he grew up. He didn't choose that rule. It was installed before he could question it,
                  and it had him overcommitted to the point of drowning. The pressure I saw at my door wasn't
                  about me. It was four open loops wearing a disguise.
                </p>
                <p>Most people walk around carrying versions of that same weight and have no idea what's actually in it.</p>
                <p className="hiw-disclosure">Details changed to protect privacy.</p>
              </div>
            </div>
          </div>
        </section>

        <div className="tunnel-spacer" aria-hidden="true" />

        {/* ── The problem ── */}
        <section className="hiw-section">
          <div className="hiw-container">
            <div className="tunnel-panel hiw-panel">
              <span className="hiw-section-label">The problem:</span>
              <div className="hiw-prose">
                <div className="hiw-problem-quotes">
                  <p>"No matter what I do, I just feel drained."</p>
                  <p>"I'm exhausted."</p>
                  <p>"I don't know what to do next."</p>
                </div>
                <p>
                  It can show up as full cognitive overload or just a low hum of discontent. A sense that
                  life isn't going where you want it to go, and you can't say why.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="tunnel-spacer" aria-hidden="true" />

        {/* ── What's actually causing it ── */}
        <section className="hiw-section">
          <div className="hiw-container">
            <div className="tunnel-panel hiw-panel">
              <span className="hiw-section-label">What's actually causing it:</span>
              <div className="hiw-prose">
                <p>
                  Your attention is occupied by open loops. Unmade decisions. Undefined tasks. Conversations
                  you haven't had. Situations you haven't resolved.
                </p>
                <p>
                  But you don't experience them as loops. You experience them as emotions. Dread. Guilt.
                  Irritation. Exhaustion. So you treat the emotion. You vent, you distract, you push harder,
                  or you get handed a label like anxiety or depression that explains the feeling and
                  completely misses the cause.
                </p>
                <p>
                  The feeling-solution never closes anything. The loops stay open. Open loops keep consuming
                  attention whether you're looking at them or not. That constant drain is what you're calling
                  exhaustion. And here's the part almost nobody questions: most of those loops were loaded into
                  you by your environment. The job you took, the commitments you keep, the rules you run on
                  were decided through experiences you weren't paying attention to when they shaped you.
                  People will question their brain chemistry before they question their environment.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="tunnel-spacer" aria-hidden="true" />

        {/* ── What we actually do ── */}
        <section className="hiw-section">
          <div className="hiw-container">
            <div className="tunnel-panel hiw-panel">
              <span className="hiw-section-label">What we actually do:</span>
              <div className="hiw-prose">
                <p>We sit down and find what's occupying your attention. Then we run first-principles questioning on each item.</p>
                <p>Not "how do you feel about this." That's the question everyone else asks, and it keeps you in the feeling.</p>
                <p>
                  We ask "what is causing this." Then we ask what's causing that. We keep going until the
                  vague weight resolves into a concrete cause and a closable action. A named cause is
                  closable. A feeling is not.
                </p>
                <p>
                  The emotion doesn't need to be processed or managed. The loop closes. The attention it was eating gets released.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="tunnel-spacer" aria-hidden="true" />

        {/* ── Why it sticks ── */}
        <section className="hiw-section">
          <div className="hiw-container">
            <div className="tunnel-panel hiw-panel">
              <span className="hiw-section-label">Why it sticks:</span>
              <div className="hiw-prose">
                <p>
                  Do this enough times and you internalize the questioning. You start catching loops while
                  they're forming. You stop being dragged by whatever your environment loaded into you and
                  start choosing where your attention goes. That's the actual product. Not the sessions.
                  The trained ability to direct your own attention.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="tunnel-spacer" aria-hidden="true" />

        {/* ── What changes ── */}
        <section className="hiw-section">
          <div className="hiw-container">
            <div className="tunnel-panel hiw-panel">
              <span className="hiw-section-label">What changes:</span>
              <div className="hiw-prose">
                <p>
                  Freed attention is what people experience as energy coming back. Clarity. Direction.
                  Same person, same life, different allocation.
                </p>
                <p>
                  The friend at my door walked in carrying four loops he couldn't see. He left able to
                  name every one of them and knowing what closed each one. The difference wasn't that he
                  felt better. It's that the things eating him were now on a list with actions next to
                  them instead of running loose in his head.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="tunnel-spacer" aria-hidden="true" />

        {/* ── How a session works ── */}
        <section className="hiw-section">
          <div className="hiw-container">
            <div className="tunnel-panel tunnel-panel--dark hiw-panel hiw-session-panel">
              <span className="hiw-section-label">How a session works:</span>
              <div className="hiw-session-block">
                <div className="hiw-prose">
                  <p>
                    In the first session we identify the primary blocker currently demanding the most of
                    your attention. You complete a short questionnaire before we meet, which gives us a
                    clear picture of what's occupying your focus before we sit down together. The session
                    concludes with two deliverables sent to you by email: a closure map and a set of
                    closure rules. The map names each issue we identified and what closes it. The closure
                    rules govern how you engage with those issues between now and closure, so they stop
                    running in the background. If you sign up for two weeks, you have direct messaging
                    access throughout. If something we identified turns out to be wrong, or something new
                    surfaces, you reach out and we adjust. We meet again in week two to close any gaps
                    the first session missed. You leave with a second map and updated closure rules.
                  </p>
                  <p>
                    At the end of two weeks the loops that were draining you are either closed or have a
                    defined path to closure. Your attention is no longer paying rent on problems you
                    haven't addressed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="tunnel-spacer" aria-hidden="true" />

        {/* ── Closing + CTA ── */}
        <section className="hiw-closing">
          <div className="hiw-container">
            <div className="tunnel-panel hiw-panel hiw-closing-panel">
              <p className="hiw-closing-line">Same person. Same life. Different allocation.</p>
              <a
                href="https://calendly.com/ajrudd-theenactive/new-meeting-1"
                className="hiw-cta"
                target="_blank"
                rel="noopener noreferrer"
              >
                Book a session
              </a>
              <span className="tunnel-mono-hint" aria-hidden="true">ALL 8 LOOPS CLOSED ○</span>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}

export default HowItWorks;
