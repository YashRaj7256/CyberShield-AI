import { LogsProcessor } from './logs.processor';

describe('LogsProcessor', () => {
  const logId = '64f0c2f4a13d2a2d2a2d2a2d';

  const log = {
    _id: logId,
    timestamp: new Date('2026-07-01T12:00:00.000Z'),
    sourceIp: '185.220.101.34',
    destinationIp: '10.0.0.5',
    sourcePort: 4444,
    destinationPort: 22,
    protocol: 'SSH',
    action: 'DENY',
    severity: 'HIGH',
    source: 'FIREWALL',
    eventType: 'LOGIN_FAILURE',
    message: 'Failed SSH login attempt',
    country: 'Russia',
    city: 'Moscow',
    latitude: 55.7558,
    longitude: 37.6173,
    userId: 'user-1',
    userName: 'admin',
    deviceType: 'Server',
    browser: 'curl',
    os: 'Linux',
  };

  function createProcessor() {
    const securityLogModel = {
      findById: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(log),
      }),
      findByIdAndUpdate: jest.fn().mockResolvedValue(undefined),
    };

    const prisma = {
      alert: {
        create: jest.fn().mockResolvedValue({ id: 'alert-1' }),
      },
      threatScore: {
        create: jest.fn().mockResolvedValue({ id: 'score-1' }),
      },
    };

    const configService = {
      get: jest.fn().mockReturnValue('http://ml-service:8000'),
    };

    const processor = new LogsProcessor(
      securityLogModel as never,
      prisma as never,
      configService as never,
    );

    return { processor, securityLogModel, prisma };
  }

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('sends the FastAPI batch payload and stores the first detection result', async () => {
    const { processor, securityLogModel, prisma } = createProcessor();
    const fetchMock = jest
      .spyOn(global, 'fetch')
      .mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          results: [
            {
              anomaly_score: 0.87,
              threat_score: 82,
              reasons: ['High-risk country', 'Repeated login failures'],
            },
          ],
          model_used: 'IsolationForest+OneClassSVM_v1',
          processing_time_ms: 12.4,
        }),
      } as unknown as Response);

    await processor.process({ data: { logId } } as never);

    expect(fetchMock).toHaveBeenCalledWith(
      'http://ml-service:8000/api/v1/detect',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const requestBody = JSON.parse(
      (fetchMock.mock.calls[0]?.[1] as RequestInit).body as string,
    ) as { logs: Array<Record<string, unknown>> };

    expect(requestBody.logs).toHaveLength(1);
    expect(requestBody.logs[0]).toEqual(
      expect.objectContaining({
        sourceIp: log.sourceIp,
        source: log.source,
        timestamp: '2026-07-01T12:00:00.000Z',
      }),
    );

    expect(securityLogModel.findByIdAndUpdate).toHaveBeenCalledWith(logId, {
      isProcessed: true,
      anomalyScore: 0.87,
      threatScore: 82,
      processedAt: expect.any(Date),
      'metadata.reasons': ['High-risk country', 'Repeated login failures'],
    });

    expect(prisma.alert.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        type: 'BRUTE_FORCE',
        severity: 'HIGH',
        status: 'NEW',
        sourceIp: log.sourceIp,
        threatScore: 82,
        reasons: ['High-risk country', 'Repeated login failures'],
      }),
    });

    expect(prisma.threatScore.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        entityType: 'IP',
        entityValue: log.sourceIp,
        score: 82,
        category: 'HIGH_RISK',
        confidence: 0.87,
      }),
    });
  });
});
