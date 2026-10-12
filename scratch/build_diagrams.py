import os
import matplotlib.pyplot as plt
import matplotlib.patches as patches
import numpy as np

os.makedirs('scratch/diagrams', exist_ok=True)

# -------------------------------------------------------------
# 1. SDLC Process Cycle (Fig. 3.1.3.1)
# -------------------------------------------------------------
def make_sdlc():
    fig, ax = plt.subplots(figsize=(7, 7), dpi=300)
    ax.axis('off')
    
    # Donut chart
    sizes = [1, 1, 1, 1, 1, 1]
    labels = [
        '1. Threat Modeling\n& Requirements',
        '2. System Analysis\n& Architecture',
        '3. ML Pipeline\n& Dual-DB Design',
        '4. NestJS Backend\n& ML Service Code',
        '5. Verification\n& Attack Simulation',
        '6. Deployment\n& Telemetry'
    ]
    colors = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#1E293B']
    
    wedges, _ = ax.pie(sizes, labels=None, startangle=90, counterclock=False,
                       colors=colors, wedgeprops=dict(width=0.45, edgecolor='white', linewidth=2.5))
    
    # Add text on segments
    angles = np.linspace(90 - 30, -270 + 30, 6)
    for i, (wedge, label) in enumerate(zip(wedges, labels)):
        ang = (wedge.theta2 + wedge.theta1) / 2.0
        x = 0.77 * np.cos(np.deg2rad(ang))
        y = 0.77 * np.sin(np.deg2rad(ang))
        ax.text(x, y, label, ha='center', va='center', fontsize=8.5, weight='bold', color='white')
        
    # Center circle
    center_circle = plt.Circle((0, 0), 0.52, fc='white', edgecolor='#CBD5E1', linewidth=2)
    ax.add_artist(center_circle)
    ax.text(0, 0.12, 'CYBERSHIELD-AI', ha='center', va='center', fontsize=11, weight='bold', color='#0F172A')
    ax.text(0, -0.02, 'SDLC PROCESS', ha='center', va='center', fontsize=10, weight='bold', color='#2563EB')
    ax.text(0, -0.16, 'LIFECYCLE', ha='center', va='center', fontsize=9, weight='bold', color='#64748B')
    
    plt.tight_layout()
    plt.savefig('scratch/diagrams/fig_3_1_3_1_sdlc.png', bbox_inches='tight')
    plt.close()
    print('SDLC generated')

# -------------------------------------------------------------
# 2. Gantt Chart (Fig. 3.2.3.1)
# -------------------------------------------------------------
def make_gantt():
    fig, ax = plt.subplots(figsize=(10, 5), dpi=300)
    
    tasks = [
        "Pre-Project Discussion & Topic Selection",
        "Problem Investigation & Threat Survey",
        "System Architecture & Dual-DB Design",
        "ML Anomaly Engine (IForest+OCSVM+SHAP)",
        "NestJS Core Backend & Ingestion APIs",
        "Next.js SOC Dashboard & Geo-Telemetry",
        "Full System Integration & Verification",
        "Final Documentation & University Viva"
    ]
    tasks.reverse()
    
    starts = [1, 2, 4, 6, 7, 9, 12, 14]
    starts.reverse()
    durations = [3, 4, 3, 5, 5, 5, 3, 3]
    durations.reverse()
    
    y_pos = np.arange(len(tasks))
    bar_color = '#1E40AF'
    
    ax.barh(y_pos, durations, left=starts, height=0.55, align='center', color=bar_color, edgecolor='#1E3A8A')
    
    ax.set_yticks(y_pos)
    ax.set_yticklabels(tasks, fontsize=9)
    ax.set_xlabel('Project Timeline (Weeks 1 to 16)', fontsize=10, weight='bold', labelpad=8)
    ax.set_xlim(0, 17)
    ax.set_xticks(range(1, 17))
    ax.grid(axis='x', linestyle='--', alpha=0.6)
    ax.set_title('Fig. 3.2.3.1: Time Allocation Gantt Chart', fontsize=11, weight='bold', pad=10)
    
    plt.tight_layout()
    plt.savefig('scratch/diagrams/fig_3_2_3_1_gantt.png', bbox_inches='tight')
    plt.close()
    print('Gantt generated')

# -------------------------------------------------------------
# 3. Spiral Model Process Methodology (Fig. 5.4.1)
# -------------------------------------------------------------
def make_spiral():
    fig, ax = plt.subplots(figsize=(8, 7), dpi=300)
    ax.set_xlim(-5, 5)
    ax.set_ylim(-5, 5)
    ax.axis('off')
    
    # Cross axes (dashed lines)
    ax.axhline(0, color='#94A3B8', linestyle='--', linewidth=1.5)
    ax.axvline(0, color='#94A3B8', linestyle='--', linewidth=1.5)
    
    # 4 Quadrant Labels (Styled boxes)
    bbox_props = dict(boxstyle='square,pad=0.4', facecolor='white', edgecolor='#B91C1C', linewidth=1.5)
    
    ax.text(-2.7, 2.5, '1. Objectives Determination\n& Threat Models', ha='center', va='center', fontsize=9, weight='bold', bbox=bbox_props)
    ax.text(2.7, 2.5, '2. Risk Identification\n& Resolution (Prototypes)', ha='center', va='center', fontsize=9, weight='bold', bbox=bbox_props)
    ax.text(2.7, -2.5, '3. Development &\nVerification (Code & Test)', ha='center', va='center', fontsize=9, weight='bold', bbox=bbox_props)
    ax.text(-2.7, -2.5, '4. Review & Planning\n(Next Iteration)', ha='center', va='center', fontsize=9, weight='bold', bbox=bbox_props)
    
    # Archimedean spiral
    theta = np.linspace(0.8 * np.pi, 6.2 * np.pi, 800)
    r = 0.22 * theta
    x = r * np.cos(theta)
    y = r * np.sin(theta)
    ax.plot(x, y, color='#DC2626', linewidth=2.5)
    
    # Arrowhead at end
    ax.annotate('', xy=(x[-1], y[-1]), xytext=(x[-20], y[-20]),
                arrowprops=dict(arrowstyle="->", color="#DC2626", lw=2.5))
                
    ax.set_title('Fig. 5.4.1: Spiral Model Process Methodology', fontsize=11, weight='bold', pad=12)
    plt.tight_layout()
    plt.savefig('scratch/diagrams/fig_5_4_1_spiral.png', bbox_inches='tight')
    plt.close()
    print('Spiral generated')

# -------------------------------------------------------------
# 4. Multi-Tier Architecture Diagram (Fig. 8.0)
# -------------------------------------------------------------
def make_architecture():
    fig, ax = plt.subplots(figsize=(10, 7), dpi=300)
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 7)
    ax.axis('off')
    
    # Tier 1: Client Tier
    t1 = patches.FancyBboxPatch((0.5, 4.8), 9.0, 1.8, boxstyle="round,pad=0.1", fc='#F0F9FF', ec='#0284C7', lw=2)
    ax.add_patch(t1)
    ax.text(0.7, 6.35, 'CLIENT TIER (Presentation Layer)', fontsize=10, weight='bold', color='#0369A1')
    
    c1 = patches.FancyBboxPatch((1.0, 5.0), 3.8, 1.1, boxstyle="round,pad=0.05", fc='white', ec='#BAE6FD', lw=1.5)
    c2 = patches.FancyBboxPatch((5.2, 5.0), 3.8, 1.1, boxstyle="round,pad=0.05", fc='white', ec='#BAE6FD', lw=1.5)
    ax.add_patch(c1)
    ax.add_patch(c2)
    ax.text(2.9, 5.65, 'Next.js 16 + React 19 SPA', fontsize=9, weight='bold', ha='center', color='#0F172A')
    ax.text(2.9, 5.25, 'Interactive SOC, Alert Triage, Log Explorer', fontsize=7.5, ha='center', color='#475569')
    ax.text(7.1, 5.65, 'Recharts & Leaflet Interactive Maps', fontsize=9, weight='bold', ha='center', color='#0F172A')
    ax.text(7.1, 5.25, 'Global Attack Geo-Telemetry, Threat Trends', fontsize=7.5, ha='center', color='#475569')
    
    # Arrow between T1 and T2
    ax.annotate('', xy=(5.0, 4.3), xytext=(5.0, 4.8),
                arrowprops=dict(arrowstyle="<->", color="#0284C7", lw=2))
    ax.text(5.1, 4.55, 'REST APIs (JWT) / SSE Telemetry', fontsize=8, color='#0284C7', weight='bold')

    # Tier 2: Application Services Tier
    t2 = patches.FancyBboxPatch((0.5, 2.5), 9.0, 1.8, boxstyle="round,pad=0.1", fc='#FEFCE8', ec='#CA8A04', lw=2)
    ax.add_patch(t2)
    ax.text(0.7, 4.05, 'APPLICATION SERVICES TIER (Business Logic, Queues & AI Microservices)', fontsize=10, weight='bold', color='#A16207')
    
    s1 = patches.FancyBboxPatch((1.0, 2.7), 3.8, 1.1, boxstyle="round,pad=0.05", fc='white', ec='#FEF08A', lw=1.5)
    s2 = patches.FancyBboxPatch((5.2, 2.7), 3.8, 1.1, boxstyle="round,pad=0.05", fc='white', ec='#FEF08A', lw=1.5)
    ax.add_patch(s1)
    ax.add_patch(s2)
    ax.text(2.9, 3.35, 'NestJS 11 REST API Server (:3001)', fontsize=9, weight='bold', ha='center', color='#0F172A')
    ax.text(2.9, 2.95, 'JWT Auth, RBAC, Ingest Controller, Alerts Service', fontsize=7.5, ha='center', color='#475569')
    ax.text(7.1, 3.35, 'FastAPI ML Microservice (:8000)', fontsize=9, weight='bold', ha='center', color='#0F172A')
    ax.text(7.1, 2.95, 'Isolation Forest, OCSVM, SHAP Explainer, Attack Predictor', fontsize=7.5, ha='center', color='#475569')
    
    # Double arrow between NestJS and ML service
    ax.annotate('', xy=(4.8, 3.25), xytext=(5.2, 3.25),
                arrowprops=dict(arrowstyle="<->", color="#CA8A04", lw=1.5))

    # Arrow between T2 and T3
    ax.annotate('', xy=(5.0, 2.0), xytext=(5.0, 2.5),
                arrowprops=dict(arrowstyle="<->", color="#475569", lw=2))
    ax.text(5.1, 2.25, 'TCP Connection Pool / ORM & ODM', fontsize=8, color='#475569', weight='bold')

    # Tier 3: Data Persistence Tier
    t3 = patches.FancyBboxPatch((0.5, 0.2), 9.0, 1.8, boxstyle="round,pad=0.1", fc='#F8FAFC', ec='#64748B', lw=2)
    ax.add_patch(t3)
    ax.text(0.7, 1.75, 'DATA PERSISTENCE & CACHING TIER', fontsize=10, weight='bold', color='#334155')
    
    d1 = patches.FancyBboxPatch((1.0, 0.4), 3.8, 1.1, boxstyle="round,pad=0.05", fc='white', ec='#CBD5E1', lw=1.5)
    d2 = patches.FancyBboxPatch((5.2, 0.4), 3.8, 1.1, boxstyle="round,pad=0.05", fc='white', ec='#CBD5E1', lw=1.5)
    ax.add_patch(d1)
    ax.add_patch(d2)
    ax.text(2.9, 1.05, 'PostgreSQL 16 Relational DB (Prisma)', fontsize=9, weight='bold', ha='center', color='#0F172A')
    ax.text(2.9, 0.65, 'Users, Incident Alerts, Threat Scores, Blocked IPs', fontsize=7.5, ha='center', color='#475569')
    ax.text(7.1, 1.05, 'MongoDB 7 & Redis 7 (Mongoose / BullMQ)', fontsize=9, weight='bold', ha='center', color='#0F172A')
    ax.text(7.1, 0.65, 'Raw Security Logs Store, Job Queues, ML Models Store', fontsize=7.5, ha='center', color='#475569')
    
    plt.tight_layout()
    plt.savefig('scratch/diagrams/fig_8_0_architecture.png', bbox_inches='tight')
    plt.close()
    print('Architecture generated')

# -------------------------------------------------------------
# 5. Class Diagram (Fig. 8.1)
# -------------------------------------------------------------
def make_class_diagram():
    fig, ax = plt.subplots(figsize=(10, 7.5), dpi=300)
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 8)
    ax.axis('off')
    
    def draw_uml_box(x, y, w, h, name, attrs, methods):
        # Header
        hdr_h = 0.45
        hdr = patches.Rectangle((x, y + h - hdr_h), w, hdr_h, facecolor='#1E3A8A', edgecolor='#0F172A', lw=1.5)
        ax.add_patch(hdr)
        ax.text(x + w/2, y + h - 0.23, name, color='white', weight='bold', fontsize=9.5, ha='center', va='center')
        
        # Body
        body = patches.Rectangle((x, y), w, h - hdr_h, facecolor='#F8FAFC', edgecolor='#0F172A', lw=1.5)
        ax.add_patch(body)
        
        # Attributes
        cur_y = y + h - hdr_h - 0.22
        for a in attrs:
            ax.text(x + 0.12, cur_y, a, fontsize=7.5, color='#0F172A')
            cur_y -= 0.22
            
        # Divider line
        ax.plot([x, x + w], [cur_y + 0.05, cur_y + 0.05], color='#CBD5E1', lw=1)
        cur_y -= 0.15
        
        # Methods
        for m in methods:
            ax.text(x + 0.12, cur_y, m, fontsize=7.5, color='#1E40AF', style='italic')
            cur_y -= 0.22
            
    # Class: User
    draw_uml_box(0.5, 4.8, 2.7, 2.8, "User", [
        "+ id: UUID (PK)",
        "+ email: String",
        "+ password: Hash",
        "+ firstName: String",
        "+ lastName: String",
        "+ role: RoleEnum",
        "+ isActive: Boolean"
    ], [
        "+ validatePassword()",
        "+ hasPermission()",
        "+ getAssignedAlerts()"
    ])
    
    # Class: SecurityLog
    draw_uml_box(3.6, 4.5, 2.8, 3.1, "SecurityLog", [
        "+ id: String (Mongo _id)",
        "+ timestamp: DateTime",
        "+ sourceIp: String",
        "+ destinationIp: String",
        "+ protocol: ProtocolEnum",
        "+ severity: SeverityEnum",
        "+ action: ActionEnum",
        "+ isProcessed: Boolean"
    ], [
        "+ extractFeatures()",
        "+ normalizeVector()",
        "+ markProcessed()"
    ])
    
    # Class: Alert
    draw_uml_box(6.8, 4.6, 2.7, 3.0, "Alert", [
        "+ id: UUID (PK)",
        "+ type: AlertTypeEnum",
        "+ severity: SeverityEnum",
        "+ status: StatusEnum",
        "+ threatScore: Float",
        "+ reasons: JsonArray",
        "+ assignedToId: UUID (FK)"
    ], [
        "+ updateStatus()",
        "+ assignAnalyst()",
        "+ generateReport()"
    ])
    
    # Class: ThreatScore
    draw_uml_box(0.5, 0.8, 2.7, 2.8, "ThreatScore", [
        "+ id: UUID (PK)",
        "+ entityType: EntityEnum",
        "+ entityValue: String",
        "+ score: Float (0-100)",
        "+ category: CategoryEnum",
        "+ factors: JsonObject",
        "+ confidence: Float"
    ], [
        "+ calculateCategory()",
        "+ getHighRiskFactors()",
        "+ evaluateDrift()"
    ])
    
    # Class: MLModelEnsemble
    draw_uml_box(3.6, 0.8, 2.8, 2.8, "MLModelEnsemble", [
        "+ iforest: IsolationForest",
        "+ ocsvm: OneClassSVM",
        "+ scaler: StandardScaler",
        "+ shapEngine: TreeExplainer",
        "+ modelVersion: String"
    ], [
        "+ predictAnomaly()",
        "+ computeCompositeScore()",
        "+ explainAttribution()"
    ])

    # Class: BlockedIP
    draw_uml_box(6.8, 0.8, 2.7, 2.8, "BlockedIP", [
        "+ id: UUID (PK)",
        "+ ipAddress: String",
        "+ reason: String",
        "+ blockedById: UUID (FK)",
        "+ isActive: Boolean",
        "+ expiresAt: DateTime"
    ], [
        "+ unblock()",
        "+ checkStatus()",
        "+ extendExpiry()"
    ])
    
    # Connections
    ax.annotate('', xy=(3.6, 6.2), xytext=(3.2, 6.2), arrowprops=dict(arrowstyle="->", lw=1.5, color='#0F172A'))
    ax.text(3.35, 6.35, '1..*', fontsize=8, weight='bold')
    
    ax.annotate('', xy=(6.8, 6.1), xytext=(6.4, 6.1), arrowprops=dict(arrowstyle="->", lw=1.5, color='#0F172A'))
    ax.text(6.5, 6.25, '1..*', fontsize=8, weight='bold')

    ax.annotate('', xy=(1.8, 3.6), xytext=(1.8, 4.8), arrowprops=dict(arrowstyle="->", lw=1.5, color='#0F172A'))
    ax.text(1.9, 4.2, '1..*', fontsize=8, weight='bold')

    ax.annotate('', xy=(5.0, 3.6), xytext=(5.0, 4.5), arrowprops=dict(arrowstyle="->", lw=1.5, color='#0F172A'))
    ax.text(5.1, 4.0, 'analyzes', fontsize=7.5, style='italic')

    ax.annotate('', xy=(8.1, 3.6), xytext=(8.1, 4.6), arrowprops=dict(arrowstyle="->", lw=1.5, color='#0F172A'))
    ax.text(8.2, 4.1, 'triggers', fontsize=7.5, style='italic')

    plt.tight_layout()
    plt.savefig('scratch/diagrams/fig_8_1_class_diagram.png', bbox_inches='tight')
    plt.close()
    print('Class diagram generated')

# -------------------------------------------------------------
# 6. Use-Case Diagram (Fig. 8.2)
# -------------------------------------------------------------
def make_use_case():
    fig, ax = plt.subplots(figsize=(10, 7.5), dpi=300)
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 8)
    ax.axis('off')
    
    # System boundary box
    sys_box = patches.FancyBboxPatch((2.2, 0.4), 5.6, 7.2, boxstyle="round,pad=0.1", fc='#F8FAFC', ec='#1E3A8A', lw=2)
    ax.add_patch(sys_box)
    ax.text(5.0, 7.3, 'CyberShield-AI Threat Intelligence Platform', fontsize=11, weight='bold', color='#1E3A8A', ha='center')
    
    # Stick figure drawing function
    def draw_actor(x, y, label):
        head = plt.Circle((x, y + 0.35), 0.15, fc='white', ec='#0F172A', lw=1.8)
        ax.add_artist(head)
        ax.plot([x, x], [y + 0.2, y - 0.25], color='#0F172A', lw=1.8)
        ax.plot([x - 0.2, x + 0.2], [y + 0.05, y + 0.05], color='#0F172A', lw=1.8)
        ax.plot([x, x - 0.2], [y - 0.25, y - 0.6], color='#0F172A', lw=1.8)
        ax.plot([x, x + 0.2], [y - 0.25, y - 0.6], color='#0F172A', lw=1.8)
        ax.text(x, y - 0.85, label, fontsize=8.5, weight='bold', ha='center', color='#0F172A')

    # Draw Actors
    draw_actor(1.0, 5.5, 'Security Analyst\n(ANALYST)')
    draw_actor(1.0, 2.2, 'SOC Administrator\n(ADMIN)')
    draw_actor(9.0, 4.0, 'Network Sensors /\nLog Forwarders')
    
    # Use Case Ovals inside boundary
    ucs = [
        (5.0, 6.7, 'Register & Authenticate (JWT & RBAC)'),
        (5.0, 5.9, 'Ingest Raw Security Logs (Syslog/JSON)'),
        (5.0, 5.1, 'Automated ML Anomaly Detection (IForest+OCSVM)'),
        (5.0, 4.3, 'XAI Explainability & SHAP Reason Attribution'),
        (5.0, 3.5, 'Triage Security Alerts & Escalate Incidents'),
        (5.0, 2.7, 'Inspect Attack Forecasts & MITRE ATT&CK Matrix'),
        (5.0, 1.9, 'Execute Active IP Containment & Blocking'),
        (5.0, 1.1, 'Generate SOC Compliance & Threat Reports')
    ]
    
    for ux, uy, utext in ucs:
        oval = patches.Ellipse((ux, uy), 4.6, 0.58, facecolor='white', edgecolor='#0284C7', lw=1.5)
        ax.add_patch(oval)
        ax.text(ux, uy, utext, fontsize=7.8, weight='bold', color='#0F172A', ha='center', va='center')
        
    # Connect Security Analyst (x=1.0, y=5.5)
    analyst_ucs = [6.7, 5.1, 4.3, 3.5, 2.7]
    for uy in analyst_ucs:
        ax.plot([1.3, 2.7], [5.5, uy], color='#64748B', lw=1.2)
        
    # Connect Admin (x=1.0, y=2.2)
    admin_ucs = [6.7, 3.5, 1.9, 1.1]
    for uy in admin_ucs:
        ax.plot([1.3, 2.7], [2.2, uy], color='#64748B', lw=1.2)
        
    # Connect Network Sensors (x=9.0, y=4.0)
    ax.plot([8.7, 7.3], [4.0, 5.9], color='#64748B', lw=1.2)
    ax.plot([8.7, 7.3], [4.0, 5.1], color='#64748B', lw=1.2)
    
    plt.tight_layout()
    plt.savefig('scratch/diagrams/fig_8_2_use_case.png', bbox_inches='tight')
    plt.close()
    print('Use case generated')

# -------------------------------------------------------------
# 7. Activity Diagram (Fig. 8.3)
# -------------------------------------------------------------
def make_activity():
    fig, ax = plt.subplots(figsize=(10, 8), dpi=300)
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 9)
    ax.axis('off')
    
    # 3 Swimlanes
    ax.plot([3.33, 3.33], [0.5, 8.5], color='#94A3B8', linestyle='--', lw=1.5)
    ax.plot([6.66, 6.66], [0.5, 8.5], color='#94A3B8', linestyle='--', lw=1.5)
    
    # Headers
    ax.text(1.66, 8.6, 'Log Forwarder / Ingestion', fontsize=9.5, weight='bold', color='#1E3A8A', ha='center')
    ax.text(5.0, 8.6, 'NestJS Backend & FastAPI ML Microservice', fontsize=9.5, weight='bold', color='#1E3A8A', ha='center')
    ax.text(8.33, 8.6, 'Security Analyst / SOC Team', fontsize=9.5, weight='bold', color='#1E3A8A', ha='center')
    
    def draw_act_box(x, y, text, w=2.6, h=0.55):
        rect = patches.FancyBboxPatch((x - w/2, y - h/2), w, h, boxstyle="round,pad=0.08", fc='white', ec='#1E40AF', lw=1.5)
        ax.add_patch(rect)
        ax.text(x, y, text, fontsize=7.5, weight='bold', ha='center', va='center', color='#0F172A')

    # Initial Start Node
    c_start = plt.Circle((1.66, 8.0), 0.14, fc='#0F172A', ec='#0F172A')
    ax.add_artist(c_start)
    
    ax.annotate('', xy=(1.66, 7.4), xytext=(1.66, 7.85), arrowprops=dict(arrowstyle="->", lw=1.5, color='#0F172A'))
    draw_act_box(1.66, 7.1, 'Stream Security Log\nEvent (HTTP/POST)')
    
    # Arrow across to NestJS
    ax.annotate('', xy=(3.7, 7.1), xytext=(2.96, 7.1), arrowprops=dict(arrowstyle="->", lw=1.5, color='#0F172A'))
    draw_act_box(5.0, 7.1, 'Validate Payload Schema\n& Insert to MongoDB')
    
    ax.annotate('', xy=(5.0, 6.4), xytext=(5.0, 6.8), arrowprops=dict(arrowstyle="->", lw=1.5, color='#0F172A'))
    draw_act_box(5.0, 6.1, 'Enqueue Job {logId}\ninto Redis BullMQ Queue')
    
    ax.annotate('', xy=(5.0, 5.4), xytext=(5.0, 5.8), arrowprops=dict(arrowstyle="->", lw=1.5, color='#0F172A'))
    draw_act_box(5.0, 5.1, 'BullMQ Worker Dispatches\nto FastAPI ML Engine')
    
    ax.annotate('', xy=(5.0, 4.4), xytext=(5.0, 4.8), arrowprops=dict(arrowstyle="->", lw=1.5, color='#0F172A'))
    draw_act_box(5.0, 4.1, 'Isolation Forest + OCSVM\nEvaluate Anomaly Score')
    
    # Diamond Decision
    diamond = patches.Polygon([[5.0, 3.4], [5.6, 3.0], [5.0, 2.6], [4.4, 3.0]], facecolor='#FEF08A', edgecolor='#CA8A04', lw=1.5)
    ax.add_patch(diamond)
    ax.text(5.0, 3.0, 'ThreatScore\n>= 60?', fontsize=7.5, weight='bold', ha='center', va='center', color='#713F12')
    
    ax.annotate('', xy=(5.0, 3.4), xytext=(5.0, 3.8), arrowprops=dict(arrowstyle="->", lw=1.5, color='#0F172A'))
    
    # No branch -> Mark Safe in MongoDB
    ax.plot([4.4, 3.6, 3.6], [3.0, 3.0, 2.1], color='#0F172A', lw=1.5)
    ax.annotate('', xy=(3.6, 1.8), xytext=(3.6, 2.1), arrowprops=dict(arrowstyle="->", lw=1.5, color='#0F172A'))
    ax.text(3.9, 3.1, 'No [Score<60]', fontsize=7.5, color='#DC2626', weight='bold')
    draw_act_box(3.6, 1.5, 'Mark Processed & Safe\nin MongoDB Database', w=2.4)
    
    # Yes branch -> Create Alert
    ax.plot([5.6, 6.4, 6.4], [3.0, 3.0, 2.1], color='#0F172A', lw=1.5)
    ax.annotate('', xy=(6.4, 1.8), xytext=(6.4, 2.1), arrowprops=dict(arrowstyle="->", lw=1.5, color='#0F172A'))
    ax.text(5.7, 3.1, 'Yes [Score>=60]', fontsize=7.5, color='#16A34A', weight='bold')
    draw_act_box(6.4, 1.5, 'Compute SHAP Reasons &\nInsert Alert in PostgreSQL', w=2.4)
    
    # Arrow to Analyst
    ax.annotate('', xy=(7.05, 1.5), xytext=(7.6, 1.5), arrowprops=dict(arrowstyle="<-", lw=1.5, color='#0F172A'))
    draw_act_box(8.33, 1.5, 'Inspect Alert, Triage &\nBlock Malicious Source IP', w=2.4)
    
    # End node
    c_end_outer = plt.Circle((5.0, 0.8), 0.18, fc='none', ec='#0F172A', lw=1.8)
    c_end_inner = plt.Circle((5.0, 0.8), 0.11, fc='#0F172A', ec='#0F172A')
    ax.add_artist(c_end_outer)
    ax.add_artist(c_end_inner)
    
    ax.plot([3.6, 3.6, 4.8], [1.2, 0.8, 0.8], color='#0F172A', lw=1.5)
    ax.plot([8.33, 8.33, 5.2], [1.2, 0.8, 0.8], color='#0F172A', lw=1.5)
    
    plt.tight_layout()
    plt.savefig('scratch/diagrams/fig_8_3_activity.png', bbox_inches='tight')
    plt.close()
    print('Activity diagram generated')

# -------------------------------------------------------------
# 8. DFD Level 0 Context Diagram (Fig. 8.4 a)
# -------------------------------------------------------------
def make_dfd0():
    fig, ax = plt.subplots(figsize=(10, 6), dpi=300)
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 6)
    ax.axis('off')
    
    # Center Process 0.0 (Circle)
    p0 = plt.Circle((5.0, 3.0), 1.35, fc='#EFF6FF', ec='#1D4ED8', lw=2.5)
    ax.add_artist(p0)
    ax.text(5.0, 3.4, '0.0', fontsize=12, weight='bold', color='#1D4ED8', ha='center')
    ax.text(5.0, 3.0, 'CyberShield-AI', fontsize=11, weight='bold', color='#0F172A', ha='center')
    ax.text(5.0, 2.65, 'Platform', fontsize=10, weight='bold', color='#0F172A', ha='center')
    
    # External Entity 1: Security Analyst
    e1 = patches.Rectangle((0.5, 3.6), 2.2, 1.4, fc='white', ec='#0F172A', lw=1.8)
    ax.add_patch(e1)
    ax.text(1.6, 4.3, 'Security Analyst\n(User)', fontsize=9.5, weight='bold', ha='center', va='center')
    
    # External Entity 2: Log Sources
    e2 = patches.Rectangle((0.5, 1.0), 2.2, 1.4, fc='white', ec='#0F172A', lw=1.8)
    ax.add_patch(e2)
    ax.text(1.6, 1.7, 'Network Sensors &\nLog Sources', fontsize=9.5, weight='bold', ha='center', va='center')
    
    # External Entity 3: System Administrator
    e3 = patches.Rectangle((7.3, 2.3), 2.2, 1.4, fc='white', ec='#0F172A', lw=1.8)
    ax.add_patch(e3)
    ax.text(8.4, 3.0, 'SOC Administrator\n(User)', fontsize=9.5, weight='bold', ha='center', va='center')
    
    # Data Flows (Arrows)
    # Analyst <-> System
    ax.annotate('', xy=(3.8, 3.8), xytext=(2.7, 4.5), arrowprops=dict(arrowstyle="->", lw=1.4, color='#1E40AF'))
    ax.text(2.9, 4.35, 'Credentials / Triage Status', fontsize=7.5, weight='bold', color='#1E40AF', rotation=28)
    
    ax.annotate('', xy=(2.7, 4.0), xytext=(3.7, 3.3), arrowprops=dict(arrowstyle="->", lw=1.4, color='#1E40AF'))
    ax.text(2.6, 3.45, 'Threat Feeds / SHAP Alerts', fontsize=7.5, weight='bold', color='#1E40AF', rotation=28)

    # Log Sources -> System
    ax.annotate('', xy=(3.9, 2.3), xytext=(2.7, 1.7), arrowprops=dict(arrowstyle="->", lw=1.4, color='#1E40AF'))
    ax.text(2.6, 2.15, 'Raw Security Logs (JSON/Syslog)', fontsize=7.5, weight='bold', color='#1E40AF', rotation=24)

    # Admin <-> System
    ax.annotate('', xy=(6.3, 3.3), xytext=(7.3, 3.5), arrowprops=dict(arrowstyle="->", lw=1.4, color='#1E40AF'))
    ax.text(6.3, 3.6, 'Admin Settings / User CRUD', fontsize=7.5, weight='bold', color='#1E40AF')

    ax.annotate('', xy=(7.3, 2.7), xytext=(6.3, 2.7), arrowprops=dict(arrowstyle="->", lw=1.4, color='#1E40AF'))
    ax.text(6.4, 2.45, 'Audit Logs & KPI Telemetry', fontsize=7.5, weight='bold', color='#1E40AF')

    plt.tight_layout()
    plt.savefig('scratch/diagrams/fig_8_4_a_dfd0.png', bbox_inches='tight')
    plt.close()
    print('DFD0 generated')

# -------------------------------------------------------------
# 9. DFD Level 1 Subsystem Decomposition (Fig. 8.4 b)
# -------------------------------------------------------------
def make_dfd1():
    fig, ax = plt.subplots(figsize=(10, 7.5), dpi=300)
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 8)
    ax.axis('off')
    
    # 5 Subprocesses (Circles)
    procs = [
        (1.8, 6.2, '1.0\nUser Auth &\nAccess Control'),
        (5.0, 6.2, '2.0\nLog Ingestion &\nQueue Dispatch'),
        (8.2, 6.2, '3.0\nML Threat\nEngine (XAI)'),
        (3.4, 2.0, '4.0\nAlert Triage &\nContainment'),
        (6.8, 2.0, '5.0\nSOC Dashboard\n& Telemetry')
    ]
    
    for px, py, ptxt in procs:
        c = plt.Circle((px, py), 1.05, fc='#EFF6FF', ec='#2563EB', lw=2)
        ax.add_artist(c)
        ax.text(px, py, ptxt, fontsize=8, weight='bold', color='#0F172A', ha='center', va='center')
        
    # 4 Data Stores (Open rectangles)
    stores = [
        (1.8, 4.1, 'D1: MongoDB (securitylogs)'),
        (5.0, 4.1, 'D2: Redis (BullMQ Queue)'),
        (8.2, 4.1, 'D3: PostgreSQL (Relational)'),
        (5.0, 0.6, 'D4: ML Model Store (*.joblib)')
    ]
    
    for sx, sy, stxt in stores:
        # Draw open top/bottom horizontal lines
        w, h = 2.4, 0.45
        ax.plot([sx - w/2, sx + w/2], [sy + h/2, sy + h/2], color='#0F172A', lw=1.8)
        ax.plot([sx - w/2, sx + w/2], [sy - h/2, sy - h/2], color='#0F172A', lw=1.8)
        ax.text(sx, sy, stxt, fontsize=7.5, weight='bold', color='#1E40AF', ha='center', va='center')
        
    # Connect Subsystems & Stores
    # 2.0 -> D1
    ax.annotate('', xy=(2.4, 4.3), xytext=(4.3, 5.6), arrowprops=dict(arrowstyle="->", lw=1.4, color='#475569'))
    # 2.0 -> D2
    ax.annotate('', xy=(5.0, 4.4), xytext=(5.0, 5.15), arrowprops=dict(arrowstyle="->", lw=1.4, color='#475569'))
    # D2 -> 3.0
    ax.annotate('', xy=(7.4, 5.6), xytext=(5.6, 4.3), arrowprops=dict(arrowstyle="->", lw=1.4, color='#475569'))
    # 3.0 -> D3
    ax.annotate('', xy=(8.2, 4.4), xytext=(8.2, 5.15), arrowprops=dict(arrowstyle="->", lw=1.4, color='#475569'))
    # D4 -> 3.0
    ax.annotate('', xy=(8.5, 5.2), xytext=(5.8, 0.8), arrowprops=dict(arrowstyle="->", lw=1.4, color='#475569'))
    # D3 -> 4.0
    ax.annotate('', xy=(4.4, 2.5), xytext=(7.3, 3.8), arrowprops=dict(arrowstyle="->", lw=1.4, color='#475569'))
    # D3 -> 5.0
    ax.annotate('', xy=(7.2, 3.0), xytext=(7.8, 3.8), arrowprops=dict(arrowstyle="->", lw=1.4, color='#475569'))

    plt.tight_layout()
    plt.savefig('scratch/diagrams/fig_8_4_b_dfd1.png', bbox_inches='tight')
    plt.close()
    print('DFD1 generated')

# -------------------------------------------------------------
# 10. ER Diagram Symbols (Fig. 8.5.1)
# -------------------------------------------------------------
def make_er_symbols():
    fig, ax = plt.subplots(figsize=(8, 7), dpi=300)
    ax.set_xlim(0, 8)
    ax.set_ylim(0, 7)
    ax.axis('off')
    
    symbols = [
        ("Entity (Strong Entity)", "rect"),
        ("Relationship (Associates Entities)", "diamond"),
        ("Attribute (Entity Property)", "oval"),
        ("Key Attribute (Primary Key)", "pk_oval"),
        ("Multivalued Attribute", "multi_oval"),
        ("Composite / Derived Attribute", "dashed_oval")
    ]
    
    cur_y = 6.2
    for label, shape in symbols:
        if shape == "rect":
            r = patches.Rectangle((0.8, cur_y - 0.25), 1.8, 0.5, facecolor='white', edgecolor='#0F172A', lw=1.8)
            ax.add_patch(r)
        elif shape == "diamond":
            d = patches.Polygon([[1.7, cur_y + 0.3], [2.6, cur_y], [1.7, cur_y - 0.3], [0.8, cur_y]],
                                facecolor='white', edgecolor='#0F172A', lw=1.8)
            ax.add_patch(d)
        elif shape == "oval":
            o = patches.Ellipse((1.7, cur_y), 1.8, 0.5, facecolor='white', edgecolor='#0F172A', lw=1.8)
            ax.add_patch(o)
        elif shape == "pk_oval":
            o = patches.Ellipse((1.7, cur_y), 1.8, 0.5, facecolor='white', edgecolor='#0F172A', lw=1.8)
            ax.add_patch(o)
            ax.text(1.7, cur_y, 'ID (PK)', fontsize=7.5, weight='bold', ha='center', va='center')
        elif shape == "multi_oval":
            o1 = patches.Ellipse((1.7, cur_y), 1.8, 0.5, facecolor='white', edgecolor='#0F172A', lw=1.8)
            o2 = patches.Ellipse((1.7, cur_y), 1.6, 0.38, facecolor='white', edgecolor='#0F172A', lw=1.2)
            ax.add_patch(o1)
            ax.add_patch(o2)
        elif shape == "dashed_oval":
            o = patches.Ellipse((1.7, cur_y), 1.8, 0.5, facecolor='white', edgecolor='#0F172A', lw=1.8, linestyle='--')
            ax.add_patch(o)
            
        # Arrow pointing to label
        ax.annotate('', xy=(3.8, cur_y), xytext=(3.0, cur_y), arrowprops=dict(arrowstyle="->", lw=1.5, color='#0F172A'))
        ax.text(4.1, cur_y, label, fontsize=9.5, weight='bold', color='#0F172A', va='center')
        cur_y -= 1.05
        
    plt.tight_layout()
    plt.savefig('scratch/diagrams/fig_8_5_1_er_symbols.png', bbox_inches='tight')
    plt.close()
    print('ER symbols generated')

# -------------------------------------------------------------
# 11. Chen ER Diagram (Fig. 8.5.2)
# -------------------------------------------------------------
def make_er_diagram():
    fig, ax = plt.subplots(figsize=(10, 7.5), dpi=300)
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 8)
    ax.axis('off')
    
    # Entities (Rectangles)
    def draw_ent(x, y, w, h, text):
        r = patches.Rectangle((x - w/2, y - h/2), w, h, facecolor='#1E40AF', edgecolor='#0F172A', lw=1.8)
        ax.add_patch(r)
        ax.text(x, y, text, color='white', weight='bold', fontsize=9.5, ha='center', va='center')
        
    def draw_rel(x, y, text):
        d = patches.Polygon([[x, y + 0.35], [x + 0.7, y], [x, y - 0.35], [x - 0.7, y]],
                            facecolor='white', edgecolor='#0284C7', lw=1.5)
        ax.add_patch(d)
        ax.text(x, y, text, fontsize=7.5, weight='bold', color='#0369A1', ha='center', va='center')

    def draw_attr(x, y, text, is_pk=False):
        o = patches.Ellipse((x, y), 1.4, 0.38, facecolor='white', edgecolor='#64748B', lw=1.2)
        ax.add_patch(o)
        txt = ax.text(x, y, text, fontsize=7, color='#0F172A', ha='center', va='center')
        if is_pk:
            txt.set_fontweight('bold')
            ax.plot([x - 0.3, x + 0.3], [y - 0.1, y - 0.1], color='#0F172A', lw=1)

    # USER entity
    draw_ent(2.0, 6.2, 1.8, 0.7, 'USER')
    draw_attr(1.0, 7.4, 'user_id (PK)', is_pk=True)
    draw_attr(2.3, 7.5, 'email')
    draw_attr(3.4, 7.2, 'role')
    ax.plot([1.0, 1.6], [7.2, 6.55], color='#64748B', lw=1)
    ax.plot([2.3, 2.0], [7.3, 6.55], color='#64748B', lw=1)
    ax.plot([3.4, 2.4], [7.0, 6.55], color='#64748B', lw=1)

    # ALERT entity
    draw_ent(8.0, 6.2, 1.8, 0.7, 'ALERT')
    draw_attr(7.0, 7.3, 'alert_id (PK)', is_pk=True)
    draw_attr(8.3, 7.5, 'severity')
    draw_attr(9.2, 7.0, 'threat_score')
    ax.plot([7.0, 7.6], [7.1, 6.55], color='#64748B', lw=1)
    ax.plot([8.3, 8.0], [7.3, 6.55], color='#64748B', lw=1)
    ax.plot([9.2, 8.4], [6.8, 6.55], color='#64748B', lw=1)

    # Relationship: USER - Manages - ALERT
    draw_rel(5.0, 6.2, 'Manages')
    ax.plot([2.9, 4.3], [6.2, 6.2], color='#0F172A', lw=1.5)
    ax.plot([5.7, 7.1], [6.2, 6.2], color='#0F172A', lw=1.5)
    ax.text(3.1, 6.35, '1', fontsize=8, weight='bold')
    ax.text(6.9, 6.35, 'N', fontsize=8, weight='bold')

    # SECURITY_LOG entity
    draw_ent(5.0, 3.2, 2.4, 0.7, 'SECURITY_LOG')
    draw_attr(3.6, 2.2, 'log_id (PK)', is_pk=True)
    draw_attr(5.0, 2.0, 'source_ip')
    draw_attr(6.4, 2.2, 'dest_ip')
    ax.plot([3.6, 4.3], [2.4, 2.85], color='#64748B', lw=1)
    ax.plot([5.0, 5.0], [2.2, 2.85], color='#64748B', lw=1)
    ax.plot([6.4, 5.7], [2.4, 2.85], color='#64748B', lw=1)

    # Relationship: ALERT - Generated_From - SECURITY_LOG
    draw_rel(6.8, 4.7, 'Triggers')
    ax.plot([7.6, 7.2], [5.85, 4.9], color='#0F172A', lw=1.5)
    ax.plot([6.4, 5.8], [4.5, 3.55], color='#0F172A', lw=1.5)
    ax.text(7.6, 5.3, '1', fontsize=8, weight='bold')
    ax.text(6.1, 3.8, 'N', fontsize=8, weight='bold')

    # Relationship: USER - Ingests - SECURITY_LOG
    draw_rel(3.2, 4.7, 'Ingests')
    ax.plot([2.4, 2.8], [5.85, 4.9], color='#0F172A', lw=1.5)
    ax.plot([3.6, 4.2], [4.5, 3.55], color='#0F172A', lw=1.5)
    ax.text(2.3, 5.3, '1', fontsize=8, weight='bold')
    ax.text(3.9, 3.8, 'N', fontsize=8, weight='bold')

    # THREAT_SCORE entity
    draw_ent(8.0, 1.8, 2.2, 0.7, 'THREAT_SCORE')
    draw_attr(7.8, 0.7, 'score_id', is_pk=True)
    draw_attr(9.1, 0.9, 'composite_score')
    ax.plot([7.8, 7.9], [0.9, 1.45], color='#64748B', lw=1)
    ax.plot([9.1, 8.4], [1.1, 1.45], color='#64748B', lw=1)

    # Relationship: SECURITY_LOG - Evaluates - THREAT_SCORE
    draw_rel(6.8, 2.5, 'Evaluates')
    ax.plot([6.2, 6.4], [3.2, 2.7], color='#0F172A', lw=1.5)
    ax.plot([7.2, 7.4], [2.3, 2.0], color='#0F172A', lw=1.5)
    ax.text(6.1, 3.0, '1', fontsize=8, weight='bold')
    ax.text(7.5, 2.2, '1', fontsize=8, weight='bold')

    plt.tight_layout()
    plt.savefig('scratch/diagrams/fig_8_5_2_er_diagram.png', bbox_inches='tight')
    plt.close()
    print('ER diagram generated')

if __name__ == '__main__':
    make_sdlc()
    make_gantt()
    make_spiral()
    make_architecture()
    make_class_diagram()
    make_use_case()
    make_activity()
    make_dfd0()
    make_dfd1()
    make_er_symbols()
    make_er_diagram()
    print('ALL DIAGRAMS SUCCESSFULLY GENERATED!')
