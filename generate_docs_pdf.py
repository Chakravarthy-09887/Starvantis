"""
STARVANTIS Aerospace Intelligence Platform
Comprehensive Presentation, Architecture, Terms, References & Educational Guide PDF Generator
Engineered with ReportLab for publication-grade typesetting, typography, and mathematical rigor.
"""

import os
import sys
from datetime import datetime

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    KeepTogether,
    PageBreak,
    HRFlowable,
)
from reportlab.pdfgen import canvas

# ==========================================
# COLOR PALETTE (Aerospace High-Assurance)
# ==========================================
PRIMARY = colors.HexColor("#0B192C")      # Deep Space Midnight Navy
SECONDARY = colors.HexColor("#1E3E62")    # Slate Orbital Blue
ACCENT_CYAN = colors.HexColor("#0891B2")  # High-contrast Cyan Teal
ACCENT_AMBER = colors.HexColor("#D97706") # Solar Warning Amber
ACCENT_GREEN = colors.HexColor("#059669") # Telemetry Nominal Green
ACCENT_RED = colors.HexColor("#DC2626")   # Critical Collision Red
TEXT_DARK = colors.HexColor("#0F172A")    # Crisp High-Contrast Charcoal
TEXT_MUTED = colors.HexColor("#475569")   # Muted Caption Grey
BG_LIGHT = colors.HexColor("#F8FAFC")     # Card Light Background
BG_HEADER = colors.HexColor("#0F172A")    # Table Header Dark
BORDER_COLOR = colors.HexColor("#CBD5E1") # Divider Grey

# ==========================================
# NUMBERED CANVAS FOR RUNNING HEADER & FOOTER
# ==========================================
class StarvantisCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(StarvantisCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_page_decorations(self, page_count):
        if self._pageNumber == 1:
            # Cover page has its own dedicated header
            return

        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(TEXT_MUTED)

        # Running Header
        self.drawString(50, letter[1] - 34, "STARVANTIS // AEROSPACE INTELLIGENCE PLATFORM")
        self.setFont("Helvetica", 8)
        self.drawRightString(letter[0] - 50, letter[1] - 34, "PROJECT PRESENTATION, ARCHITECTURE & TERMS MANUAL")
        
        # Header Line
        self.setStrokeColor(BORDER_COLOR)
        self.setLineWidth(0.75)
        self.line(50, letter[1] - 38, letter[0] - 50, letter[1] - 38)

        # Footer Line
        self.line(50, 42, letter[0] - 50, 42)

        # Running Footer
        self.drawString(50, 30, "CONFIDENTIAL & PROPRIETARY — FOR ACADEMIC, VIVA & MISSION PRESENTATION USE")
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(letter[0] - 50, 30, page_str)
        self.restoreState()


# ==========================================
# MAIN PDF BUILDER
# ==========================================
def build_pdf(filename="STARVANTIS_Project_Terms_References_Architecture_Guide.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=50,
        rightMargin=50,
        topMargin=44,
        bottomMargin=44,
    )

    styles = getSampleStyleSheet()

    # Custom Typography Styles
    title_style = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=PRIMARY,
        spaceAfter=5,
    )
    
    subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=14,
        textColor=ACCENT_CYAN,
        spaceAfter=10,
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13.5,
        leading=17,
        textColor=PRIMARY,
        spaceBefore=8,
        spaceAfter=5,
        keepWithNext=True,
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=14,
        textColor=SECONDARY,
        spaceBefore=7,
        spaceAfter=4,
        keepWithNext=True,
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.2,
        leading=11.5,
        textColor=TEXT_DARK,
        spaceAfter=4,
    )

    body_bold = ParagraphStyle(
        'Body_Bold',
        parent=body_style,
        fontName='Helvetica-Bold',
    )

    caption_style = ParagraphStyle(
        'Caption_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=7.5,
        leading=10,
        textColor=TEXT_MUTED,
        spaceAfter=3,
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10.5,
        textColor=colors.white,
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.6,
        leading=10.2,
        textColor=TEXT_DARK,
    )

    table_cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=table_cell_style,
        fontName='Helvetica-Bold',
        textColor=PRIMARY,
    )

    callout_text = ParagraphStyle(
        'CalloutText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.8,
        leading=11,
        textColor=PRIMARY,
    )

    content_width = letter[0] - 100 # 512 pt

    def make_callout(title, text, color=ACCENT_CYAN, bg_color=colors.HexColor("#F0F9FF")):
        content = [
            Paragraph(f"<b>{title}</b>", ParagraphStyle('CTitle', parent=callout_text, fontName='Helvetica-Bold', textColor=color, spaceAfter=2)),
            Paragraph(text, callout_text)
        ]
        t = Table([[content]], colWidths=[content_width])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), bg_color),
            ('BOX', (0,0), (-1,-1), 1, color),
            ('LEFTPADDING', (0,0), (-1,-1), 8),
            ('RIGHTPADDING', (0,0), (-1,-1), 8),
            ('TOPPADDING', (0,0), (-1,-1), 4),
            ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ]))
        return t

    story = []

    # =========================================================================
    # PAGE 1: TITLE & EXECUTIVE SUMMARY & MISSION STATEMENT
    # =========================================================================
    story.append(Paragraph("STARVANTIS", ParagraphStyle('CoverBadge', parent=subtitle_style, fontSize=10, textColor=ACCENT_CYAN, spaceAfter=2)))
    story.append(Paragraph("Aerospace Intelligence &amp; Autonomous Fleet Operations Platform", title_style))
    story.append(Paragraph("Technical Presentation Guide, System Architecture, Operational Terms, and Astrodynamics Compendium", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=PRIMARY, spaceAfter=8))

    meta_table_data = [
        [
            Paragraph("<b>Document Scope:</b> Technical Reference &amp; Presentation Compendium", table_cell_style),
            Paragraph("<b>Target Audience:</b> Project Evaluators, Faculty, Mission Reviewers", table_cell_style)
        ],
        [
            Paragraph("<b>Core Frameworks:</b> Next.js 15, FastAPI, SQLAlchemy 2.0, WebSockets", table_cell_style),
            Paragraph("<b>Physics Engines:</b> SGP4 Ephemeris, 2D Gaussian P<sub>c</sub>, &Delta;V Solver", table_cell_style)
        ],
        [
            Paragraph("<b>Live External Feeds:</b> NASA Open APIs (NeoWs, DONKI, APOD)", table_cell_style),
            Paragraph(f"<b>Generation Date:</b> {datetime.now().strftime('%B %d, %Y')} | Version 1.0.0", table_cell_style)
        ]
    ]
    meta_table = Table(meta_table_data, colWidths=[content_width/2, content_width/2])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), BG_LIGHT),
        ('BOX', (0,0), (-1,-1), 1, BORDER_COLOR),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('PADDING', (0,0), (-1,-1), 4.5),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 8))

    story.append(Paragraph("1. Executive Summary &amp; Project Mission", h1_style))
    story.append(Paragraph(
        "<b>STARVANTIS</b> is a next-generation aerospace intelligence platform engineered to bridge the critical operational gap between real-world orbital telemetry downlinks and autonomous space mission management. In the modern space era, low Earth orbit (LEO) faces exponential congestion from mega-constellations and uncooperative space debris, while deep-space missions to the Moon and Sun-Earth Lagrange points demand real-time telemetry processing with zero human latency.",
        body_style
    ))
    story.append(Paragraph(
        "The STARVANTIS platform integrates real-time multi-variate telemetry streaming, SGP4 orbital propagation, 2D Gaussian collision probability calculations, Tsiolkovsky &Delta;V evasion solvers, Entry Descent and Landing (EDL) simulations, space weather radiation tracking, defense-grade cybersecurity (CCSDS SDLS), and natural language flight direction (JARVIS Copilot) into a unified, high-performance mission control center.",
        body_style
    ))
    
    story.append(Spacer(1, 4))
    story.append(make_callout(
        "★ WHY STARVANTIS WAS CREATED &amp; WHAT MAKES IT UNIQUE FOR PRESENTATION",
        "• <b>Live Multi-Tier Architecture:</b> Combines high-speed asynchronous WebSockets (1Hz-50Hz) with Next.js 15 and FastAPI.<br/>"
        "• <b>Real Astrodynamic Solvers:</b> Employs mathematical 2D Gaussian collision probability integrals, SGP4 state propagation, and Tsiolkovsky &Delta;V burn calculations rather than static mockups.<br/>"
        "• <b>Authentic Space Science:</b> Integrates real NASA NeoWs asteroid feeds, DONKI space weather streams, Aditya-L1 L1 solar physics, Chandrayaan-3 lunar surface temperature profiles (ChaSTE), and JWST L2 cryogenics.<br/>"
        "• <b>Defense-Grade Security:</b> Features CCSDS 355.0-B-1 Space Data Link Security, HMAC-SHA256 hardware Root-of-Trust verification, and GNSS Receiver Autonomous Integrity Monitoring (RAIM).",
        color=PRIMARY,
        bg_color=colors.HexColor("#F1F5F9")
    ))

    story.append(PageBreak())

    # =========================================================================
    # PAGE 2: SYSTEM ARCHITECTURE & TELEMETRY PIPELINE
    # =========================================================================
    story.append(Paragraph("2. System Architecture &amp; Data Pipeline", h1_style))
    story.append(Paragraph(
        "STARVANTIS employs a high-throughput, decoupled client-server architecture designed for sub-second telemetry ingestion, deterministic astrodynamic computation, and fluid 60fps holographic rendering.",
        body_style
    ))

    arch_layers = [
        [
            Paragraph("<b>Architecture Layer</b>", table_header_style),
            Paragraph("<b>Technologies &amp; Protocols</b>", table_header_style),
            Paragraph("<b>Core Function &amp; Rationale in Project Presentation</b>", table_header_style),
        ],
        [
            Paragraph("<b>Presentation &amp; UI</b>", table_cell_bold),
            Paragraph("Next.js 15 (App Router), React 19, TypeScript, TailwindCSS, Framer Motion, HTML5 Canvas 3D Vectors", table_cell_style),
            Paragraph("Delivers zero-latency HUDs, interactive 3D attitude gyroscopes, holographic digital twins, and dynamic orbital radar tracks.", table_cell_style),
        ],
        [
            Paragraph("<b>Real-Time Streaming</b>", table_cell_bold),
            Paragraph("WebSockets (<b>/ws/mission</b>), Web Audio API Synthesizers", table_cell_style),
            Paragraph("Streams 1Hz multi-variate telemetry and broadcasts instant alert dispatches and telecommand acknowledgments with acoustic sirens.", table_cell_style),
        ],
        [
            Paragraph("<b>Application Core (API)</b>", table_cell_bold),
            Paragraph("FastAPI (Asynchronous Python 3.11+), Pydantic v2, Uvicorn ASGI Server", table_cell_style),
            Paragraph("Provides non-blocking asynchronous REST endpoints, SGP4 orbital propagation, collision risk solvers, and AI flight copilot reasoning.", table_cell_style),
        ],
        [
            Paragraph("<b>Data &amp; Persistence</b>", table_cell_bold),
            Paragraph("SQLAlchemy 2.0 ORM, Alembic, SQLite (dev) / TimescaleDB &amp; PostgreSQL 16 (prod)", table_cell_style),
            Paragraph("Stores immutable telemetry hypertables, orbital object catalogs, operator RBAC credentials, and cryptographically verified audit trails.", table_cell_style),
        ],
        [
            Paragraph("<b>External Space Feeds</b>", table_cell_bold),
            Paragraph("NASA Open APIs (NeoWs, DONKI, APOD), NOAA Space Weather Predictions", table_cell_style),
            Paragraph("Ingests live Near-Earth Asteroid trajectory vectors, solar flare classifications, Coronal Mass Ejection (CME) alerts, and geomagnetic storm indices.", table_cell_style),
        ],
        [
            Paragraph("<b>Security &amp; Auth</b>", table_cell_bold),
            Paragraph("HMAC-SHA256 Root-of-Trust, ECDSA P-384, JWT Tokens, CCSDS SDLS (355.0-B-1)", table_cell_style),
            Paragraph("Guarantees flight-hardware uplink command authenticity, prevents replay attacks, and detects spoofed GNSS navigation signals via RAIM.", table_cell_style),
        ],
    ]

    arch_table = Table(arch_layers, colWidths=[95, 145, 272])
    arch_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), BG_HEADER),
        ('BOX', (0,0), (-1,-1), 1, BORDER_COLOR),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('PADDING', (0,0), (-1,-1), 4),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, BG_LIGHT]),
    ]))
    story.append(arch_table)
    story.append(Spacer(1, 8))

    story.append(Paragraph("High-Throughput Telemetry &amp; Conjunction Processing Pipeline", h2_style))
    story.append(Paragraph(
        "<b>1. Telemetry Ingestion:</b> Multi-variate packets (Voltage, Current, Temperatures, Attitude Euler Angles, Sub-satellite Coordinates, Orbital Velocities) ingested via <b>POST /api/v1/telemetry</b> or simulated continuous pulse generator.<br/>"
        "<b>2. AI Anomaly &amp; Residual Drift Engine:</b> Compares live measurements against physical models. Deviations exceeding dynamic &plusmn;2.5&sigma; thresholds flag automated severity alerts.<br/>"
        "<b>3. SGP4 &amp; Conjunction Analysis Engine:</b> Propagates orbital state vectors forward in time, computes minimum Euclidean miss distance (d<sub>miss</sub>) at Time of Closest Approach (TCA), and solves 2D Gaussian collision probability (P<sub>c</sub>).<br/>"
        "<b>4. Maneuver Optimization:</b> Solves Tsiolkovsky &Delta;V for optimal retrograde, prograde, or out-of-plane evasive burns.<br/>"
        "<b>5. WebSocket Broadcast &amp; HUD Render:</b> Live packets pushed to connected Next.js clients for instant 3D telemetry display.",
        body_style
    ))

    story.append(PageBreak())

    # =========================================================================
    # PAGE 3: CONSTELLATION & SATELLITE DIGITAL TWIN
    # =========================================================================
    story.append(Paragraph("3. Website Modules: Terms, Features &amp; References", h1_style))
    story.append(Paragraph("3.1 Constellation Fleet &amp; 3D Satellite Digital Twin", h2_style))
    story.append(Paragraph(
        "<b>What it is:</b> A real-time virtual replica (Digital Twin) of active spacecraft assets (including Chandrayaan-3, Aditya-L1, Sentinel-6A, Gaganyaan-G1, JWST, NISAR, and Cartosat-3) displaying live subsystem health, attitude dynamics, and interactive 3D orientations.<br/>"
        "<b>Why it is used:</b> Spacecraft operating thousands of kilometers away cannot be visually inspected. Digital twins fuse downlinked telemetry into an intuitive visual representation, allowing operators to immediately assess solar panel illumination, battery thermal states, and orientation stability.",
        body_style
    ))

    twin_terms = [
        [
            Paragraph("<b>Telemetry Term / Subsystem</b>", table_header_style),
            Paragraph("<b>Technical Definition &amp; Measurement Unit</b>", table_header_style),
            Paragraph("<b>Operational Importance &amp; Failure Mode Prevented</b>", table_header_style),
        ],
        [
            Paragraph("<b>EPS (Electrical Power Subsystem)</b>", table_cell_bold),
            Paragraph("Main Bus Voltage (V), Solar Array Generation (kW), Battery State of Charge (SOC %). Nominal: 28.0V &plusmn; 0.8V.", table_cell_style),
            Paragraph("Prevents battery deep-discharge during eclipse transits and manages autonomous shunt regulators to avoid over-voltage conditions.", table_cell_style),
        ],
        [
            Paragraph("<b>TCS (Thermal Control Subsystem)</b>", table_cell_bold),
            Paragraph("Multi-node thermocouple monitoring (&deg;C / K) across battery bays, payload optical benches, and propellant lines.", table_cell_style),
            Paragraph("Regulates heat dissipation via active radiator louvers and MLI blankets, preventing thermal runaway or propellant line freezing.", table_cell_style),
        ],
        [
            Paragraph("<b>AODCS (Attitude &amp; Orbit Control)</b>", table_cell_bold),
            Paragraph("Euler angles: Roll (&phi;), Pitch (&theta;), Yaw (&psi;) in degrees (&deg;), measured via Star Trackers and Gyro IMUs.", table_cell_style),
            Paragraph("Maintains precise antenna pointing toward ground stations and solar panel alignment toward the Sun. Eliminates tumbling risks.", table_cell_style),
        ],
        [
            Paragraph("<b>TT&amp;C (Telemetry, Tracking &amp; Command)</b>", table_cell_bold),
            Paragraph("Carrier Signal Strength (dBm), Signal-to-Noise Ratio (SNR dB), Uplink/Downlink data rates (kbps/Mbps).", table_cell_style),
            Paragraph("Monitors communication link margin to ensure reliable telecommand uplinks and high-bandwidth payload scientific downlinks.", table_cell_style),
        ],
        [
            Paragraph("<b>Health Index Score (%)</b>", table_cell_bold),
            Paragraph("Fused multi-sensor weighted metric (0-100%) computed from EPS, TCS, AODCS, and RF communications status.", table_cell_style),
            Paragraph("Provides a rapid, holistic indicator for fleet commanders to prioritize attention across dozens of orbital assets simultaneously.", table_cell_style),
        ],
        [
            Paragraph("<b>Multi-variate Residual Drift</b>", table_cell_bold),
            Paragraph("Statistical tracking of telemetry deviations: Residual = Y<sub>measured</sub> - Y<sub>model</sub>.", table_cell_style),
            Paragraph("Detects insidious sensor degradation, battery degradation, and friction build-up in reaction wheels before catastrophic failure.", table_cell_style),
        ],
    ]
    t_twin = Table(twin_terms, colWidths=[120, 160, 232])
    t_twin.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), BG_HEADER),
        ('BOX', (0,0), (-1,-1), 1, BORDER_COLOR),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('PADDING', (0,0), (-1,-1), 4),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, BG_LIGHT]),
    ]))
    story.append(t_twin)

    story.append(PageBreak())

    # =========================================================================
    # PAGE 4: ORBITAL CONJUNCTIONS & COLLISION AVOIDANCE MANEUVER (CAM)
    # =========================================================================
    story.append(Paragraph("3.2 Orbital Conjunctions &amp; Collision Avoidance Maneuvers (CAM)", h2_style))
    story.append(Paragraph(
        "<b>What it is:</b> An automated astrodynamic screening engine that monitors close approaches between active satellites, defunct space debris, and NASA Near-Earth Objects (NEOs), computing optimal evasive thruster burns.<br/>"
        "<b>Why it is used:</b> With over 36,000 tracked debris fragments orbiting Earth at velocities exceeding 7.5 km/s (27,000 km/h), hypervelocity impacts can catastrophically disintegrate multi-million-dollar satellites (Kessler Syndrome). Automated CAM algorithms provide deterministic, propellant-efficient evasion strategies.",
        body_style
    ))

    conj_terms = [
        [
            Paragraph("<b>Orbital / CAM Term</b>", table_header_style),
            Paragraph("<b>Scientific Definition &amp; Formula</b>", table_header_style),
            Paragraph("<b>Application in STARVANTIS Platform</b>", table_header_style),
        ],
        [
            Paragraph("<b>TLE (Two-Line Element Set)</b>", table_cell_bold),
            Paragraph("Standardized 140-character orbital data format encoding satellite epoch, inclination, eccentricity, RAAN, and mean motion.", table_cell_style),
            Paragraph("Ingested to calculate real-time Keplerian orbital tracks and forward propagate satellite constellations across future epochs.", table_cell_style),
        ],
        [
            Paragraph("<b>SGP4 (Simplified General Perturbations-4)</b>", table_cell_bold),
            Paragraph("Analytical orbital propagation model accounting for Earth oblateness (J<sub>2</sub>, J<sub>3</sub>, J<sub>4</sub>), atmospheric drag, and lunar-solar gravities.", table_cell_style),
            Paragraph("Executes high-speed orbital position and velocity projections (X, Y, Z, Vx, Vy, Vz) in Earth-Centered Inertial (ECI) coordinates.", table_cell_style),
        ],
        [
            Paragraph("<b>TCA (Time of Closest Approach)</b>", table_cell_bold),
            Paragraph("The exact UTC timestamp where the Euclidean distance between two orbital objects reaches its global minimum.", table_cell_style),
            Paragraph("Defines the countdown clock for flight operators to execute evasion burns before irreversible close approach occurs.", table_cell_style),
        ],
        [
            Paragraph("<b>Miss Distance (d<sub>miss</sub>)</b>", table_cell_bold),
            Paragraph("Minimum geometric spatial distance (km) between primary satellite and secondary debris at TCA.", table_cell_style),
            Paragraph("Trigger threshold: d<sub>miss</sub> &lt; 2.0 km initiates critical alerts; d<sub>miss</sub> &lt; 25.0 km initiates monitoring.", table_cell_style),
        ],
        [
            Paragraph("<b>Collision Probability (P<sub>c</sub>)</b>", table_cell_bold),
            Paragraph("2D Gaussian probability density integral:<br/><b>P<sub>c</sub> &approx; (r<sub>hard</sub><sup>2</sup> / 2&sigma;<sup>2</sup>) &middot; exp(-d<sub>miss</sub><sup>2</sup> / 2&sigma;<sup>2</sup>)</b>", table_cell_style),
            Paragraph("Quantifies true collision risk by combining miss distance with position covariance uncertainty ellipsoids. Threshold: P<sub>c</sub> &gt; 1.0 &times; 10<sup>-4</sup>.", table_cell_style),
        ],
        [
            Paragraph("<b>Delta-V (&Delta;V) Evasion Solver</b>", table_cell_bold),
            Paragraph("Velocity increment vector (m/s) required to expand miss distance, governed by Tsiolkovsky's Rocket Equation.", table_cell_style),
            Paragraph("Computes 3 maneuver options: Optimal Retrograde Apogee Burn (0.42 m/s), Prograde Phasing Burn (0.58 m/s), and Normal Out-of-Plane Burn (1.15 m/s).", table_cell_style),
        ],
    ]
    t_conj = Table(conj_terms, colWidths=[120, 180, 212])
    t_conj.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), BG_HEADER),
        ('BOX', (0,0), (-1,-1), 1, BORDER_COLOR),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('PADDING', (0,0), (-1,-1), 4),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, BG_LIGHT]),
    ]))
    story.append(t_conj)

    story.append(PageBreak())

    # =========================================================================
    # PAGE 5: ENTRY, DESCENT & LANDING (EDL) SIMULATION
    # =========================================================================
    story.append(Paragraph("3.3 Lunar &amp; Planetary Entry, Descent &amp; Landing (EDL)", h2_style))
    story.append(Paragraph(
        "<b>What it is:</b> An interactive 6-DOF descent simulator analyzing the Entry, Descent, and Landing (EDL) sequence of lunar and planetary missions (specifically Chandrayaan-3 and Vikram Lander at the Lunar South Pole).<br/>"
        "<b>Why it is used:</b> Landing on an airless celestial body requires 100% autonomous propulsive deceleration (often termed the '15 Minutes of Terror'). This module demonstrates the exact scientific transition phases, failure root causes from Chandrayaan-2, and engineering fixes that ensured Chandrayaan-3's historic success.",
        body_style
    ))

    edl_phases = [
        [
            Paragraph("<b>EDL Stage</b>", table_header_style),
            Paragraph("<b>Altitude &amp; Velocity Dynamics</b>", table_header_style),
            Paragraph("<b>Chandrayaan-2 Failure Analysis vs Chandrayaan-3 Engineering Fix</b>", table_header_style),
        ],
        [
            Paragraph("<b>1. Rough Braking Phase</b>", table_cell_bold),
            Paragraph("30 km -&gt; 7.4 km<br/>1,680 m/s -&gt; 358 m/s<br/>Thrust: 80% (4x 800N Engines)", table_cell_style),
            Paragraph("<b>CH-2:</b> Small thrust fluctuations accumulated slight velocity errors.<br/><b>CH-3 Fix:</b> Added +150 kg propellant margin and expanded throttle tolerance bands.", table_cell_style),
        ],
        [
            Paragraph("<b>2. Attitude Hold Phase</b>", table_cell_bold),
            Paragraph("7.4 km -&gt; 6.8 km<br/>358 m/s -&gt; 336 m/s<br/>Thrust: 65% Continuous Throttle", table_cell_style),
            Paragraph("<b>CH-2:</b> Optical camera latency hindered real-time velocity vector determination.<br/><b>CH-3 Fix:</b> Integrated <b>Laser Doppler Velocimeter (LDV)</b> providing 3-axis velocity locking independent of optical lighting.", table_cell_style),
        ],
        [
            Paragraph("<b>3. Fine Braking Phase<br/>(Critical Failure Node)</b>", table_cell_bold),
            Paragraph("6.8 km -&gt; 800 m<br/>336 m/s -&gt; 60 m/s<br/>Turn Rate: High Slew (4.8&deg;/s)", table_cell_style),
            Paragraph("<b>CH-2 FAILURE NODE:</b> Guidance attempted to eliminate accumulated velocity dispersion. Turn rate exceeded gyro constraint; thrusters failed to throttle down fast enough, causing trajectory divergence.<br/><b>CH-3 FIX:</b> Unbounded attitude correction software; removed central 5th engine to eliminate plume aerodynamic interference; expanded landing zone from 500m x 500m to <b>4.0 km x 2.4 km</b>.", table_cell_style),
        ],
        [
            Paragraph("<b>4. Terminal Hover &amp; Touchdown</b>", table_cell_bold),
            Paragraph("800 m -&gt; 0 m (Shiv Shakti Point)<br/>60 m/s -&gt; 1.2 m/s<br/>Turn Rate: 0.0&deg;/s (True Vertical)", table_cell_style),
            Paragraph("<b>CH-2:</b> Hard impact at 58 m/s vertical velocity.<br/><b>CH-3 SUCCESS:</b> LHDAC autonomous hazard avoidance camera redirected lander away from boulders; reinforced landing legs absorbed up to 3.0 m/s impact and 12&deg; slope.", table_cell_style),
        ],
    ]
    t_edl = Table(edl_phases, colWidths=[105, 145, 262])
    t_edl.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), BG_HEADER),
        ('BOX', (0,0), (-1,-1), 1, BORDER_COLOR),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('PADDING', (0,0), (-1,-1), 3.5),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, BG_LIGHT]),
    ]))
    story.append(t_edl)

    story.append(PageBreak())

    # =========================================================================
    # PAGE 6: DEEP SPACE & LAGRANGE OBSERVATORIES
    # =========================================================================
    story.append(Paragraph("3.4 Deep-Space Science &amp; Lagrange Point Observatories", h2_style))
    story.append(Paragraph(
        "<b>What it is:</b> Dedicated telemetry and payload scientific visualization modules for Sun-Earth L1 (Aditya-L1), Lunar South Pole (Chandrayaan-3), and Sun-Earth L2 (JWST).<br/>"
        "<b>Why it is used:</b> Deep-space exploration operates outside Earth orbit where communication light-time delays (1.28s to 5.02s) require high autonomy and specialized scientific sensors.",
        body_style
    ))

    deep_terms = [
        [
            Paragraph("<b>Spacecraft &amp; Orbit Regime</b>", table_header_style),
            Paragraph("<b>Key Payloads &amp; Instruments</b>", table_header_style),
            Paragraph("<b>Telemetry Parameters &amp; Scientific Objectives</b>", table_header_style),
        ],
        [
            Paragraph("<b>ADITYA-L1</b><br/>Sun-Earth L1 Halo Orbit (1.5 Million km from Earth)", table_cell_bold),
            Paragraph("• <b>VELC:</b> Visible Emission Line Coronagraph<br/>• <b>SUIT:</b> Solar Ultraviolet Imaging Telescope<br/>• <b>ASPEX:</b> Solar Wind Particle Experiment<br/>• <b>MAG:</b> Triaxial Digital Magnetometer", table_cell_style),
            Paragraph("Monitors Fe XIV 530.3nm coronal plasma emissions, real-time Coronal Mass Ejections (CMEs), solar wind proton/alpha ratios (4.25%), and Interplanetary Magnetic Field (B<sub>x</sub>, B<sub>y</sub>, B<sub>z</sub> in nT) with 4.98s light delay.", table_cell_style),
        ],
        [
            Paragraph("<b>CHANDRAYAAN-3</b><br/>Lunar South Pole<br/>(Shiv Shakti Point, 69.37&deg; S)", table_cell_bold),
            Paragraph("• <b>ChaSTE:</b> Surface Thermophysical Experiment<br/>• <b>ILSA:</b> Lunar Seismic Activity Instrument<br/>• <b>APXS:</b> Alpha Particle X-Ray Spectrometer<br/>• <b>RAMBHA-LP:</b> Langmuir Plasma Probe", table_cell_style),
            Paragraph("Measures 10-point vertical lunar regolith thermal gradient (+50.4&deg;C surface vs -10.2&deg;C at 10cm depth), moonquakes, and elemental abundances (Silicon 21.4%, Aluminum 14.8%, Calcium 9.6%, Iron 8.2%, Sulfur 0.34%).", table_cell_style),
        ],
        [
            Paragraph("<b>JWST (James Webb)</b><br/>Sun-Earth L2 Halo Orbit (Anti-Sunward 1.5M km)", table_cell_bold),
            Paragraph("• <b>5-Layer Kapton Sunshield</b><br/>• <b>MIRI:</b> Mid-Infrared Instrument Cryocooler<br/>• <b>NIRSpec:</b> Microshutter Multi-Object Array<br/>• <b>FGS:</b> Fine Guidance Sensor", table_cell_style),
            Paragraph("Maintains extreme thermal gradient (+85.2&deg;C hot side vs 39.8 K cold side), MIRI cryogenic cooling to <b>6.4 K</b>, and sub-milliarcsecond (0.0012 mas) pointing jitter for cosmic deep-field spectroscopy (z = 11.4).", table_cell_style),
        ],
    ]
    t_deep = Table(deep_terms, colWidths=[120, 160, 232])
    t_deep.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), BG_HEADER),
        ('BOX', (0,0), (-1,-1), 1, BORDER_COLOR),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('PADDING', (0,0), (-1,-1), 4),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, BG_LIGHT]),
    ]))
    story.append(t_deep)
    story.append(Spacer(1, 6))

    story.append(make_callout(
        "🛰️ DEEP-SPACE LAGRANGE POINT ORBITAL STABILITY",
        "Lagrange points L1 and L2 are meta-stable saddle points in the Sun-Earth gravitational potential field. Spacecraft like Aditya-L1 and JWST do not orbit a physical mass, but execute <b>quasi-periodic Halo / Lissajous orbits</b> around the mathematical libration point. To prevent drifting away into heliocentric orbit, STARVANTIS computes autonomous <b>Station-Keeping &Delta;V burns (&approx; 2.45 m/s per year)</b> using low-thrust RCS hydrazine thrusters.",
        color=PRIMARY,
        bg_color=colors.HexColor("#F8FAFC")
    ))

    story.append(PageBreak())

    # =========================================================================
    # PAGE 7: SPACE WEATHER & GROUND STATIONS
    # =========================================================================
    story.append(Paragraph("3.5 Space Weather &amp; Radiation Threat Matrix", h2_style))
    weather_terms = [
        [
            Paragraph("<b>Index / Parameter</b>", table_header_style),
            Paragraph("<b>Physical Definition &amp; Normal Range</b>", table_header_style),
            Paragraph("<b>Spacecraft Impact &amp; Mitigation Strategy</b>", table_header_style),
        ],
        [
            Paragraph("<b>Planetary Kp-Index</b>", table_cell_bold),
            Paragraph("0 to 9 logarithmic geomagnetic activity index. G0 (0-4), G1 Minor (5), G2 Moderate (6), G3 Strong (7), G4 Severe (8), G5 Extreme (9).", table_cell_style),
            Paragraph("Elevated Kp values (&gt;6.0) cause upper atmospheric heating and density expansion, drastically increasing aerodynamic drag on LEO satellites.", table_cell_style),
        ],
        [
            Paragraph("<b>Solar Wind Speed &amp; IMF B<sub>z</sub></b>", table_cell_bold),
            Paragraph("Bulk plasma speed: 300 to 800+ km/s.<br/>Interplanetary Magnetic Field (IMF) B<sub>z</sub> in nanoTesla (nT).", table_cell_style),
            Paragraph("Negative (Southward) B<sub>z</sub> couples with Earth's northward magnetic field, triggering magnetic reconnection and massive geomagnetic energy injections.", table_cell_style),
        ],
        [
            Paragraph("<b>SAA (South Atlantic Anomaly)</b>", table_cell_bold),
            Paragraph("Geographic depression where inner Van Allen radiation belt dips to 200 km altitude (Lat -50&deg; to 0&deg;, Lng -90&deg; to +10&deg;).", table_cell_style),
            Paragraph("High proton flux causes <b>Single Event Upsets (SEU)</b> (memory bit-flips). Mitigation: Engage EDAC memory scrubbing and suspend optical payload exposures.", table_cell_style),
        ],
        [
            Paragraph("<b>Total Ionizing Dose (TID) &amp; Degradation</b>", table_cell_bold),
            Paragraph("Cumulative ionizing radiation absorbed in silicon (krad). Solar cell efficiency degradation: 1.2% to 3.5% over lifespan.", table_cell_style),
            Paragraph("Assesses radiation hardness of electronic components. Guides mission lifetime extensions and predicts power degradation trends.", table_cell_style),
        ],
    ]
    t_weather = Table(weather_terms, colWidths=[115, 175, 222])
    t_weather.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), BG_HEADER),
        ('BOX', (0,0), (-1,-1), 1, BORDER_COLOR),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('PADDING', (0,0), (-1,-1), 3.5),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, BG_LIGHT]),
    ]))
    story.append(t_weather)
    story.append(Spacer(1, 5))

    story.append(Paragraph("3.6 Worldwide Ground Station Network &amp; RF Link Budget", h2_style))
    gs_terms = [
        [
            Paragraph("<b>Ground Track Term</b>", table_header_style),
            Paragraph("<b>Mathematical Formula &amp; Unit</b>", table_header_style),
            Paragraph("<b>Operational Meaning in STARVANTIS</b>", table_header_style),
        ],
        [
            Paragraph("<b>AOS &amp; LOS</b>", table_cell_bold),
            Paragraph("<b>AOS:</b> Acquisition of Signal (elevation &gt; 0&deg;)<br/><b>LOS:</b> Loss of Signal (elevation &lt; 0&deg;)", table_cell_style),
            Paragraph("Defines contact window start/end for telecommand uplinks and scientific telemetry downlinks.", table_cell_style),
        ],
        [
            Paragraph("<b>Doppler Shift (&Delta;f)</b>", table_cell_bold),
            Paragraph("<b>&Delta;f = f<sub>0</sub> &middot; (v<sub>radial</sub> / c)</b><br/>Carrier: S-Band (2.2 GHz), X-Band (8.45 GHz)", table_cell_style),
            Paragraph("Rapid orbital motion (7.5 km/s) causes carrier frequency shifts of up to &plusmn;200 kHz. Ground receivers dynamically tune frequency to lock signal.", table_cell_style),
        ],
        [
            Paragraph("<b>Slant Range (R<sub>slant</sub>)</b>", table_cell_bold),
            Paragraph("R = &radic;[R<sub>E</sub><sup>2</sup> + (R<sub>E</sub>+h)<sup>2</sup> - 2R<sub>E</sub>(R<sub>E</sub>+h)cos&gamma;]<br/>Distance in km from station to satellite.", table_cell_style),
            Paragraph("Determines free-space path loss (FSPL = 20log<sub>10</sub>(d) + 20log<sub>10</sub>(f) + 92.45 dB) and required transmitter RF power.", table_cell_style),
        ],
        [
            Paragraph("<b>Bit Error Rate (BER) &amp; SNR</b>", table_cell_bold),
            Paragraph("Signal-to-Noise Ratio (SNR in dB). Target BER: &lt; 1.0 &times; 10<sup>-9</sup> for telecommands.", table_cell_style),
            Paragraph("Evaluates radio link margin across ISTRAC (32m), Goldstone (70m), Madrid (70m), and Svalbard (13m) antenna dishes.", table_cell_style),
        ],
    ]
    t_gs = Table(gs_terms, colWidths=[115, 175, 222])
    t_gs.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), BG_HEADER),
        ('BOX', (0,0), (-1,-1), 1, BORDER_COLOR),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('PADDING', (0,0), (-1,-1), 3.5),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, BG_LIGHT]),
    ]))
    story.append(t_gs)

    story.append(PageBreak())

    # =========================================================================
    # PAGE 8: CYBER DEFENSE MATRIX & JARVIS COPILOT
    # =========================================================================
    story.append(Paragraph("3.7 Spacecraft Cyber-Defense &amp; Anti-Spoofing Matrix", h2_style))
    cyber_terms = [
        [
            Paragraph("<b>Cyber-Defense Technology</b>", table_header_style),
            Paragraph("<b>Cryptographic Protocol / Standard</b>", table_header_style),
            Paragraph("<b>Threat Vector Neutralized</b>", table_header_style),
        ],
        [
            Paragraph("<b>CCSDS SDLS Protocol</b>", table_cell_bold),
            Paragraph("CCSDS 355.0-B-1 Compliant<br/>AES-GCM-256 Authenticated Encryption", table_cell_style),
            Paragraph("Encrypts and authenticates telecommands at the Space Data Link Layer, preventing unauthorized eavesdropping and hostile command injection.", table_cell_style),
        ],
        [
            Paragraph("<b>Flight Hardware Root-of-Trust</b>", table_cell_bold),
            Paragraph("HMAC-SHA256 + ECDSA P-384 hardware security module (HSM) on On-Board Computer.", table_cell_style),
            Paragraph("Validates telecommand digital signatures before passing packets to the flight computer sequence buffer. Invalid signatures are instantly quarantined.", table_cell_style),
        ],
        [
            Paragraph("<b>GNSS Anti-Spoofing &amp; RAIM</b>", table_cell_bold),
            Paragraph("Receiver Autonomous Integrity Monitoring with pseudorange residual threshold checks (&lt; 0.1 ns).", table_cell_style),
            Paragraph("Detects fake GPS/GNSS signals. If pseudorange steps exceed thresholds, the satellite autonomously rejects GNSS and falls back to Star Tracker + IMU Kalman propagation.", table_cell_style),
        ],
        [
            Paragraph("<b>Replay Attack Prevention</b>", table_cell_bold),
            Paragraph("Monotonically increasing 32-bit Frame Sequence Counters (FSC).", table_cell_style),
            Paragraph("Blocks adversaries from recording valid commands and retransmitting them later, as outdated sequence numbers are rejected by flight software.", table_cell_style),
        ],
    ]
    t_cyber = Table(cyber_terms, colWidths=[120, 160, 232])
    t_cyber.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), BG_HEADER),
        ('BOX', (0,0), (-1,-1), 1, BORDER_COLOR),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('PADDING', (0,0), (-1,-1), 3.5),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, BG_LIGHT]),
    ]))
    story.append(t_cyber)
    story.append(Spacer(1, 6))

    story.append(Paragraph("3.8 JARVIS Flight Director &amp; Natural Language Copilot", h2_style))
    story.append(Paragraph(
        "<b>What it is:</b> An aerospace domain-specific AI copilot that translates natural language operational queries into physics-grounded diagnostics, ephemeris calculations, and cryptographically verified telecommands.<br/>"
        "<b>Why it is used:</b> Enables human operators to rapidly diagnose complex fleet anomalies, query collision parameters, and authorize delta-V burn sequences using natural language with built-in aerospace safety constraints and immutable audit logs.",
        body_style
    ))

    story.append(make_callout(
        "🤖 JARVIS COPILOT COMMAND LIFECYCLE",
        "1. <b>Intent Classification:</b> NLP intent parser identifies domain (<b>CONJUNCTION</b>, <b>POWER_THERMAL</b>, <b>EPHEMERIS</b>, <b>FLEET_HEALTH</b>).<br/>"
        "2. <b>Physics Engine Calculation:</b> Generates precise metrics (e.g. 0.42 m/s retrograde burn, 0.38 kg hydrazine consumption, 99.8% risk reduction).<br/>"
        "3. <b>Cryptographic Payload Generation:</b> Generates a formatted <b>TelecommandPayload</b> with unique <b>AUTH-SIG</b> hash.<br/>"
        "4. <b>Operator Authorization &amp; Execution:</b> Operator clicks <i>Authorize &amp; Transmit</i>, writing an immutable record to <b>AuditLog</b> and broadcasting the execution event over WebSockets to all mission control consoles.",
        color=PRIMARY,
        bg_color=colors.HexColor("#F8FAFC")
    ))

    story.append(PageBreak())

    # =========================================================================
    # PAGE 9: EDUCATIONAL KEY INFORMATION & ASTRODYNAMICS EQUATIONS
    # =========================================================================
    story.append(Paragraph("4. Educational Key Information &amp; Astrodynamics Compendium", h1_style))
    story.append(Paragraph(
        "The STARVANTIS platform is grounded in fundamental laws of classical celestial mechanics, thermodynamics, and telecommunications. This section provides the key mathematical equations and concepts for presentation and technical review.",
        body_style
    ))

    edu_equations = [
        [
            Paragraph("<b>Astrodynamics Principle</b>", table_header_style),
            Paragraph("<b>Governing Mathematical Equation</b>", table_header_style),
            Paragraph("<b>Educational Concept &amp; Practical Application</b>", table_header_style),
        ],
        [
            Paragraph("<b>Kepler's Third Law<br/>(Harmonic Law)</b>", table_cell_bold),
            Paragraph("<b>T<sup>2</sup> = (4&pi;<sup>2</sup> / GM) &middot; a<sup>3</sup></b><br/>T: Orbital Period, a: Semi-Major Axis", table_cell_style),
            Paragraph("Relates satellite altitude to orbital velocity. For Sentinel-6A (a = 7,707 km), period T = 112.4 minutes (12.8 rev/day).", table_cell_style),
        ],
        [
            Paragraph("<b>Vis-Viva Equation<br/>(Orbital Energy Conservation)</b>", table_cell_bold),
            Paragraph("<b>v<sup>2</sup> = GM &middot; (2/r - 1/a)</b><br/>&mu; = GM = 398,600.44 km<sup>3</sup>/s<sup>2</sup>", table_cell_style),
            Paragraph("Calculates instantaneous orbital speed at any radial distance r. Demonstrates that satellites move fastest at perigee and slowest at apogee.", table_cell_style),
        ],
        [
            Paragraph("<b>Tsiolkovsky Rocket Equation</b>", table_cell_bold),
            Paragraph("<b>&Delta;V = I<sub>sp</sub> &middot; g<sub>0</sub> &middot; ln(m<sub>0</sub> / m<sub>f</sub>)</b><br/>I<sub>sp</sub>: Specific Impulse (230 s for Hydrazine)", table_cell_style),
            Paragraph("Determines propellant mass required for orbital adjustments. A 0.42 m/s collision avoidance burn on a 500 kg satellite requires &approx; 0.38 kg propellant.", table_cell_style),
        ],
        [
            Paragraph("<b>Stefan-Boltzmann Thermal Equilibrium</b>", table_cell_bold),
            Paragraph("<b>Q<sub>in</sub> = &epsilon; &middot; &sigma; &middot; A &middot; T<sup>4</sup></b><br/>&sigma; = 5.67 &times; 10<sup>-8</sup> W/m<sup>2</sup>K<sup>4</sup>", table_cell_style),
            Paragraph("Balances absorbed solar radiation (Q<sub>solar</sub> + Q<sub>albedo</sub> + Q<sub>int</sub>) with radiative heat dissipation to deep space (3 K vacuum).", table_cell_style),
        ],
        [
            Paragraph("<b>Doppler Frequency Shift</b>", table_cell_bold),
            Paragraph("<b>&Delta;f = f<sub>0</sub> &middot; (v<sub>radial</sub> / c)</b><br/>c = 3.0 &times; 10<sup>8</sup> m/s", table_cell_style),
            Paragraph("Shifts downlinked carrier frequencies based on satellite line-of-sight velocity relative to ground stations.", table_cell_style),
        ],
        [
            Paragraph("<b>Lagrange Points Gravitational Equilibrium</b>", table_cell_bold),
            Paragraph("<b>&nabla;&Phi;<sub>eff</sub> = 0</b><br/>Effective gravitational-centrifugal potential", table_cell_style),
            Paragraph("Defines 5 equilibrium points (L1-L5) in a two-body rotating system. Enables stable Lissajous/Halo orbits for solar/cosmic observatories.", table_cell_style),
        ],
    ]
    t_edu = Table(edu_equations, colWidths=[115, 175, 222])
    t_edu.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), BG_HEADER),
        ('BOX', (0,0), (-1,-1), 1, BORDER_COLOR),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('PADDING', (0,0), (-1,-1), 3.5),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, BG_LIGHT]),
    ]))
    story.append(t_edu)

    story.append(PageBreak())

    # =========================================================================
    # PAGE 10: PRESENTATION & PITCH MASTER GUIDE
    # =========================================================================
    story.append(Paragraph("5. Project Presentation &amp; Demonstration Master Guide", h1_style))
    story.append(Paragraph(
        "To deliver a world-class project presentation or viva defense, follow this structured narrative flow designed to highlight technical depth, UI innovation, and scientific rigor.",
        body_style
    ))

    story.append(Paragraph("5.1 Recommended 10-Minute Presentation Script &amp; Slide Outline", h2_style))
    slides = [
        ("Slide 1: Problem Statement & Vision", "The LEO congestion crisis (36k+ debris items, mega-constellations), communication delays in deep-space missions, and the need for unified autonomous aerospace situational awareness."),
        ("Slide 2: Platform Architecture", "Showcase the Next.js 15 + FastAPI decoupled architecture, 1Hz-50Hz WebSocket telemetry pipelines, and TimescaleDB hypertable persistence."),
        ("Slide 3: Real-Time 3D Digital Twin", "Demonstrate live subsystem telemetry (EPS, TCS, AODCS), interactive 3D attitude gyroscopes, and multi-satellite constellation switching."),
        ("Slide 4: Orbital Conjunction & CAM Solver", "Explain SGP4 orbital state propagation, 2D Gaussian collision probability (P<sub>c</sub>), and the Tsiolkovsky &Delta;V evasion burn generator."),
        ("Slide 5: Lunar & Planetary Landing (EDL)", "Walk through the 4 descent phases of Chandrayaan-3, explaining the failure root causes of Chandrayaan-2 and the specific sensor fixes (LDV, LHDAC)."),
        ("Slide 6: Deep-Space & Lagrange Observatories", "Highlight Aditya-L1 Sun-Earth L1 solar wind streams, Chandrayaan-3 ChaSTE subsurface temperature probes, and JWST L2 MIRI 6.4K cryocooler."),
        ("Slide 7: Space Weather & Radiation Matrix", "Discuss solar wind speed, Kp geomagnetic storm levels, and South Atlantic Anomaly (SAA) single-event upset mitigations."),
        ("Slide 8: Spacecraft Cyber Defense (CCSDS SDLS)", "Show cryptographic HMAC-SHA256 root-of-trust verification, GNSS anti-spoofing via RAIM, and replay attack neutralization."),
        ("Slide 9: JARVIS Natural Language Copilot", "Execute a live query commanding a collision avoidance burn, showing the verified telecommand payload and audit logging."),
        ("Slide 10: Conclusion & Future Roadmap", "Summarize aerospace contributions, automated autonomous flight operations, and future extensions to interplanetary fleets."),
    ]
    for title, desc in slides:
        story.append(Paragraph(f"• <b>{title}:</b> {desc}", body_style))

    story.append(Spacer(1, 4))
    story.append(Paragraph("5.2 The 'Golden Demonstration Flow' (Live Demo Sequence)", h2_style))
    story.append(Paragraph(
        "<b>1. Overview:</b> Show live constellation clock, 12 active assets, and 1Hz WebSocket pulse.<br/>"
        "<b>2. Digital Twin:</b> Select <i>Sentinel-6A</i>. Adjust zoom, rotate 3D attitude, and inspect EPS voltage (28.4V) and TCS thermal graphs.<br/>"
        "<b>3. Conjunction Analysis:</b> Open Conjunctions tab. Show active threat with uncooperative debris (P<sub>c</sub> = 1.84 &times; 10<sup>-4</sup>). Click <i>Run Trajectory Analysis</i> to show the recommended 0.42 m/s retrograde burn expanding miss distance to 18.6 km.<br/>"
        "<b>4. Chandrayaan-3 EDL:</b> Toggle between <i>Chandrayaan-2 Failure Analysis</i> and <i>Chandrayaan-3 Mitigation</i> on Phase 3 (Fine Braking) to explain the Laser Doppler Velocimeter (LDV).<br/>"
        "<b>5. Cyber-Defense Uplink:</b> Click <i>Verify Uplink Packet</i> to demonstrate flight-hardware HMAC cryptographic verification and replay attack blocking.<br/>"
        "<b>6. Copilot Execution:</b> Ask JARVIS: <i>'Execute collision avoidance maneuver for Sentinel-6A'</i>. Click <i>Authorize &amp; Transmit</i> to log the verified audit trail.",
        body_style
    ))

    story.append(PageBreak())

    # =========================================================================
    # PAGE 11: VIVA Q&A & REFERENCES / STANDARDS
    # =========================================================================
    story.append(Paragraph("5.3 Common Evaluator / Viva Questions &amp; Model Answers", h1_style))

    viva_qas = [
        (
            "Q1: How does STARVANTIS calculate collision probability (P<sub>c</sub>)?",
            "A: STARVANTIS uses an analytical 2D Gaussian probability density function integrated over the combined hard-body cross-sectional radius. It maps the relative position vector and 3-axis covariance ellipsoids onto the encounter plane (B-plane) at the Time of Closest Approach (TCA)."
        ),
        (
            "Q2: How does the system handle real-time telemetry streaming?",
            "A: The backend utilizes asynchronous FastAPI WebSockets (<b>/ws/mission</b>) to broadcast 1Hz telemetry packets and instant alert notifications. The frontend uses a custom React <b>MissionContext</b> with exponential backoff auto-reconnection and Web Audio synthesizer sirens."
        ),
        (
            "Q3: How does STARVANTIS prevent unauthorized commands from hijacking spacecraft?",
            "A: The platform implements CCSDS 355.0-B-1 Space Data Link Security (SDLS) standards with AES-GCM-256 encryption, HMAC-SHA256 hardware Root-of-Trust verification on the On-Board Computer, and monotonically increasing 32-bit Frame Sequence Counters to neutralize replay attacks."
        ),
        (
            "Q4: What role does NASA API integration play in the platform?",
            "A: NASA DONKI provides real-time solar flare, Coronal Mass Ejection (CME), and geomagnetic storm alerts, while NASA NeoWs provides orbital ephemerides for Near-Earth Asteroids, fusing external astronomical intelligence with active constellation telemetry."
        ),
    ]

    for q, a in viva_qas:
        story.append(Paragraph(f"<b>{q}</b>", body_bold))
        story.append(Paragraph(a, body_style))
        story.append(Spacer(1, 2))

    story.append(Spacer(1, 5))
    story.append(Paragraph("6. References, International Standards &amp; Bibliography", h1_style))
    references = [
        "1. <b>CCSDS 355.0-B-1:</b> <i>Space Data Link Security Protocol</i>, Consultative Committee for Space Data Systems, Blue Book, 2022.",
        "2. <b>Vallado, David A.:</b> <i>Fundamentals of Astrodynamics and Applications</i>, 5th Edition, Microcosm Press / Springer, 2022.",
        "3. <b>Hoots, Felix R. &amp; Roehrich, Ronald L.:</b> <i>Spacetrack Report No. 3: Models for Propagation of NORAD Element Sets (SGP4/SDP4)</i>, USAF Aerospace Defense Command, 1980.",
        "4. <b>ISRO (Indian Space Research Organisation):</b> <i>Chandrayaan-3 Mission Overview, Payloads &amp; Landing Site Selection</i>, ISRO Special Publications, 2023.",
        "5. <b>ISRO:</b> <i>Aditya-L1 Solar Mission Payloads (VELC, SUIT, ASPEX, MAG) Technical Specifications</i>, 2023.",
        "6. <b>NASA Jet Propulsion Laboratory (JPL):</b> <i>Deep Space Network (DSN) Telecommunications Link Design Handbook</i>, 810-005, Rev. E, 2024.",
        "7. <b>NASA Goddard Space Flight Center:</b> <i>James Webb Space Telescope (JWST) Thermal Architecture &amp; Sunshield Engineering</i>, NASA NSSDCA.",
        "8. <b>NOAA Space Weather Prediction Center (SWPC):</b> <i>Geomagnetic Storms, Solar Radiation Storms, and Radio Blackout Scales</i>, SWPC Technical Guide.",
        "9. <b>Curtis, Howard D.:</b> <i>Orbital Mechanics for Engineering Students</i>, 4th Edition, Elsevier Aerospace Engineering Series, 2020.",
        "10. <b>Akella, M. R. &amp; Alfriend, K. T.:</b> <i>Probability of Collision Between Space Objects in Circular and Elliptical Orbits</i>, Journal of Guidance, Control, and Dynamics, Vol. 23, 2000.",
    ]
    for ref in references:
        story.append(Paragraph(ref, body_style))

    story.append(Spacer(1, 6))
    story.append(HRFlowable(width="100%", thickness=1, color=BORDER_COLOR, spaceAfter=5))
    story.append(Paragraph(
        "<b>STARVANTIS Aerospace Intelligence Platform</b> — Engineered for high-assurance space situational awareness, constellation operations, and planetary exploration presentation.",
        caption_style
    ))

    # Build Document
    doc.build(story, canvasmaker=StarvantisCanvas)
    print(f"[SUCCESS] High-Precision Master PDF created at: {os.path.abspath(filename)}")

if __name__ == "__main__":
    out_file = "STARVANTIS_Project_Terms_References_Architecture_Guide.pdf"
    if len(sys.argv) > 1:
        out_file = sys.argv[1]
    build_pdf(out_file)
