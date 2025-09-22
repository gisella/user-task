import { TaskCoreService } from './task-core.service';
import { Task, TaskList, TaskRepositoryI, TaskStatus } from '@app/core/task/domain';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';

const makeTask = (overrides: Partial<Task> = {}): Task =>
  new Task({
    id: '1',
    userId: '10',
    title: 'Test',
    description: 'Desc',
    status: TaskStatus.NEW,
    ...overrides,
  } as any);

describe('TaskCoreService', () => {
  let service: TaskCoreService;
  let repo: jest.Mocked<TaskRepositoryI>;

  beforeEach(() => {
    repo = {
      save: jest.fn(),
      deleteTask: jest.fn(),
      findTask: jest.fn(),
      listTask: jest.fn(),
    } as any;

    service = new TaskCoreService(repo);
  });

  it('createTask delegates to repository', async () => {
    const t = makeTask({ id: undefined as any });
    const created = makeTask({ id: '2' });
    (repo.save as jest.Mock).mockResolvedValue(created);
    const res = await service.createTask(t);
    expect(repo.save).toHaveBeenCalledWith(t);
    expect(res).toBe(created);
  });

  describe('updateTask', () => {
    it('throws NotFound if task missing', async () => {
      (repo.findTask as jest.Mock).mockResolvedValue(null);
      await expect(
        service.updateTask('1', '10', { title: 'X' }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws Forbidden if not owner', async () => {
      (repo.findTask as jest.Mock).mockResolvedValue(makeTask({ userId: '999' }));
      await expect(
        service.updateTask('1', '10', { title: 'X' }),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('returns same task if no changes provided', async () => {
      const task = makeTask();
      (repo.findTask as jest.Mock).mockResolvedValue(task);
      const res = await service.updateTask('1', '10', {});
      expect(res).toBe(task);
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('updates fields and saves with valid status', async () => {
      const task = makeTask();
      (repo.findTask as jest.Mock).mockResolvedValue(task);
      const updated = makeTask({ title: 'T2', description: 'D2', status: TaskStatus.DONE });
      (repo.save as jest.Mock).mockResolvedValue(updated);

      const res = await service.updateTask('1', '10', {
        title: 'T2',
        description: 'D2',
        status: TaskStatus.DONE,
      });

      expect(repo.save).toHaveBeenCalled();
      expect(res).toBe(updated);
    });

    it('throws BadRequest on invalid status', async () => {
      const task = makeTask();
      (repo.findTask as jest.Mock).mockResolvedValue(task);
      await expect(
        service.updateTask('1', '10', { status: 'INVALID' as any }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('delete', () => {
    it('throws Forbidden if owner mismatch', async () => {
      (repo.findTask as jest.Mock).mockResolvedValue(makeTask({ userId: '2' }));
      await expect(service.delete('1', '10')).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('calls repo delete when owner matches', async () => {
      (repo.findTask as jest.Mock).mockResolvedValue(makeTask({ userId: '10' }));
      await service.delete('1', '10');
      expect(repo.deleteTask).toHaveBeenCalledWith('1');
    });
  });

  describe('getTask', () => {
    it('throws Forbidden if owner mismatch', async () => {
      (repo.findTask as jest.Mock).mockResolvedValue(makeTask({ userId: '2' }));
      await expect(service.getTask('1', '10')).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('returns task if owner matches', async () => {
      const t = makeTask({ userId: '10' });
      (repo.findTask as jest.Mock).mockResolvedValue(t);
      const res = await service.getTask('1', '10');
      expect(res).toBe(t);
    });
  });

  it('listTask delegates to repo', async () => {
    const list: TaskList = { items: [makeTask()], total: 1, offset: 0 };
    (repo.listTask as jest.Mock).mockResolvedValue(list);
    const res = await service.listTask({ userId: '10' });
    expect(repo.listTask).toHaveBeenCalledWith({ userId: '10' });
    expect(res).toBe(list);
  });
});
