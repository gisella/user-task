import { TaskRepository } from '@app/core/task';
import { DatabaseService } from '@app/database';
import { TaskMapper } from '@app/core/task/infrastructure/mappers/task.mapper';
import { Task, TaskStatus } from '@app/core/task/domain';

const makeDbTask = (overrides: Partial<any> = {}) => ({
  id: BigInt(1),
  user_id: BigInt(10),
  title: 'T',
  description: 'D',
  taskStatus: 'NEW',
  createdAt: new Date(),
  ...overrides,
});

describe('TaskRepository', () => {
  let repo: TaskRepository;
  let db: any;

  beforeEach(() => {
    db = {
      tasks: {
        create: jest.fn(),
        upsert: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
      },
    } as unknown as DatabaseService;

    repo = new TaskRepository(db as DatabaseService);
  });

  describe('save', () => {
    it('creates when no id', async () => {
      const task = new Task({
        userId: '10',
        title: 'T',
        description: 'D',
        status: TaskStatus.NEW,
      } as any);
      const toDbSpy = jest.spyOn(TaskMapper, 'toDbEntity');
      const toEntitySpy = jest.spyOn(TaskMapper, 'toEntity');
      const dbTask = makeDbTask({ id: BigInt(2) });
      (db.tasks.create as jest.Mock).mockResolvedValue(dbTask);
      const res = await repo.save(task);
      expect(db.tasks.create).toHaveBeenCalledWith({
        data: expect.any(Object),
      });
      expect(toDbSpy).toHaveBeenCalledWith(task);
      expect(toEntitySpy).toHaveBeenCalledWith(dbTask);
      expect(res).toBeInstanceOf(Task);
    });

    it('upserts when id present', async () => {
      const task = new Task({ id: '5', userId: '10', title: 'T' } as any);
      const dbTask = makeDbTask({ id: BigInt(5) });
      (db.tasks.upsert as jest.Mock).mockResolvedValue(dbTask);
      const res = await repo.save(task);
      expect(db.tasks.upsert).toHaveBeenCalledWith({
        where: { id: BigInt(5) },
        update: expect.any(Object),
        create: expect.any(Object),
      });
      expect(res.id).toBe('5');
    });
  });

  describe('deleteTask', () => {
    it('deletes by id', async () => {
      (db.tasks.delete as jest.Mock).mockResolvedValue({});
      await repo.deleteTask('3');
      expect(db.tasks.delete).toHaveBeenCalledWith({
        where: { id: BigInt(3) },
      });
    });

    it('throws NotFound on P2025', async () => {
      (db.tasks.delete as jest.Mock).mockRejectedValue({ code: 'P2025' });
      await expect(repo.deleteTask('3')).rejects.toBeInstanceOf(Error);
    });
  });

  describe('findTask', () => {
    it('returns null when not found', async () => {
      (db.tasks.findFirst as jest.Mock).mockResolvedValue(null);
      const res = await repo.findTask('1');
      expect(res).toBeNull();
    });

    it('returns mapped entity when found', async () => {
      const dbTask = makeDbTask();
      (db.tasks.findFirst as jest.Mock).mockResolvedValue(dbTask);
      const res = await repo.findTask('1');
      expect(res).toBeInstanceOf(Task);
      expect(res?.id).toBe('1');
      expect(res?.userId).toBe('10');
    });
  });

  describe('listTask', () => {
    it('maps filters and returns list', async () => {
      (db.tasks.count as jest.Mock).mockResolvedValue(1);
      (db.tasks.findMany as jest.Mock).mockResolvedValue([makeDbTask()]);
      const res = await repo.listTask({
        userId: '10',
        title: 'T',
        status: 'NEW',
        limit: 5,
        offset: 0,
        orderBy: 'id',
        sortOrder: 'desc',
      });
      expect(db.tasks.count).toHaveBeenCalledWith({
        where: expect.any(Object),
      });
      expect(db.tasks.findMany).toHaveBeenCalledWith({
        where: expect.any(Object),
        orderBy: { id: 'desc' },
        skip: 0,
        take: 5,
      });
      expect(res.items.length).toBe(1);
      expect(res.total).toBe(1);
    });

    it('returns empty list on error', async () => {
      (db.tasks.count as jest.Mock).mockRejectedValue(new Error('db error'));
      const res = await repo.listTask({ userId: '10' });
      expect(res.items).toEqual([]);
      expect(res.total).toBe(0);
    });
  });
});
