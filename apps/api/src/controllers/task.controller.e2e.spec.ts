import {
  CanActivate,
  ExecutionContext,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { TaskController } from './task.controller';
import { Task, TaskCoreService, TaskStatus } from '@app/core/task/domain';
import { JwtAuthGuard } from '@app/auth';

class AllowAuthAndInjectUserGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    req.user = { userId: 'u1' };
    return true;
  }
}

const makeTask = (overrides: Partial<Task> = {}): Task =>
  new Task({
    id: 't1',
    userId: 'u1',
    title: 'Test',
    description: 'Desc',
    status: TaskStatus.NEW,
    createdAt: new Date() as unknown as any,
    ...overrides,
  } as any);

describe('TaskController (e2e)', () => {
  let app: INestApplication;
  let service: jest.Mocked<TaskCoreService>;

  beforeAll(async () => {
    const builder = Test.createTestingModule({
      controllers: [TaskController],
      providers: [
        {
          provide: TaskCoreService,
          useValue: {
            createTask: jest.fn(),
            updateTask: jest.fn(),
            delete: jest.fn(),
            getTask: jest.fn(),
            listTask: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(new AllowAuthAndInjectUserGuard());

    const moduleRef: TestingModule = await builder.compile();

    app = moduleRef.createNestApplication();
    // Enable DTO transformation & validation like in real app
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    await app.init();

    service = moduleRef.get(TaskCoreService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /task creates a task and returns it', async () => {
    const created = makeTask({ id: 't2', title: 'New' });
    service.createTask.mockResolvedValue(created);

    await request(app.getHttpServer())
      .post('/task')
      .send({ title: 'New', description: 'D' })
      .expect(200)
      .expect(({ body }) => {
        expect(body).toMatchObject({ id: 't2', title: 'New' });
      });

    expect(service.createTask).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'New', description: 'D', userId: 'u1' }),
    );
  });

  it('GET /task/:taskId returns a task', async () => {
    const t = makeTask({ id: 't3' });
    service.getTask.mockResolvedValue(t);

    await request(app.getHttpServer())
      .get('/task/t3')
      .expect(200)
      .expect(({ body }) => {
        expect(body.id).toBe('t3');
      });

    expect(service.getTask).toHaveBeenCalledWith('t3', 'u1');
  });

  it('GET /task/:taskId returns 404 when not found', async () => {
    service.getTask.mockResolvedValueOnce(null);

    await request(app.getHttpServer()).get('/task/absent').expect(404);
  });

  it('PUT /task/:taskId updates a task and returns it', async () => {
    const updated = makeTask({ id: 't1', title: 'Updated' });
    service.updateTask.mockResolvedValue(updated);

    await request(app.getHttpServer())
      .put('/task/t1')
      .send({ title: 'Updated' })
      .expect(200)
      .expect(({ body }) => {
        expect(body.title).toBe('Updated');
      });

    expect(service.updateTask).toHaveBeenCalledWith('t1', 'u1', {
      title: 'Updated',
    });
  });

  it('DELETE /task/:taskId returns 204', async () => {
    service.delete.mockResolvedValue(undefined as any);

    await request(app.getHttpServer()).delete('/task/t9').expect(204);

    expect(service.delete).toHaveBeenCalledWith('t9', 'u1');
  });

  it('GET /task returns paginated list and maps params', async () => {
    const items = [makeTask({ id: 't1' })];
    service.listTask.mockResolvedValue({ items, total: 3, offset: 0 });

    await request(app.getHttpServer())
      .get('/task')
      .query({
        limit: 2,
        offset: 0,
        orderBy: 'id',
        sortOrder: 'asc',
        status: 'NEW',
        title: 'Te',
      })
      .expect(200)
      .expect(({ body }) => {
        expect(body.items).toHaveLength(1);
        expect(body.totalCount).toBe(3);
        expect(body.limit).toBe(2);
        expect(body.offset).toBe(0);
        expect(body.hasMore).toBe(true); // 3 > 0+2
      });

    expect(service.listTask).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'u1',
        limit: 2,
        offset: 0,
        orderBy: 'id',
        sortOrder: 'asc',
        status: 'NEW',
        title: 'Te',
      }),
    );
  });
});
