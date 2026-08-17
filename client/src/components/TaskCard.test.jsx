import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { DndContext } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import TaskCard from './TaskCard';

const TASK = {
  id: 'abc123',
  title: 'Book the dentist',
  completed: false,
};

// The card needs a router for the edit link and a dnd context for the grip
const renderCard = (props = {}) => {
  const task = { ...TASK, ...props.task };
  return render(
    <MemoryRouter>
      <DndContext>
        <SortableContext items={[task.id]}>
          <TaskCard
            task={task}
            onDelete={props.onDelete ?? (() => {})}
            onToggle={props.onToggle ?? (() => {})}
            sortable={props.sortable ?? false}
          />
        </SortableContext>
      </DndContext>
    </MemoryRouter>,
  );
};

describe('TaskCard', () => {
  it('shows the title', () => {
    renderCard();
    expect(screen.getByText('Book the dentist')).toBeInTheDocument();
  });

  it('uses the title as the checkbox label, so clicking the text toggles it', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    renderCard({ onToggle });

    await user.click(screen.getByText('Book the dentist'));

    expect(onToggle).toHaveBeenCalledWith(true);
  });

  it('toggles from the checkbox as well', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    renderCard({ onToggle });

    await user.click(screen.getByRole('checkbox'));

    expect(onToggle).toHaveBeenCalledWith(true);
  });

  it('unticks a completed task', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    renderCard({ task: { completed: true }, onToggle });

    await user.click(screen.getByRole('checkbox'));

    expect(onToggle).toHaveBeenCalledWith(false);
  });

  it('deletes without asking, the bin is the undo', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    renderCard({ onDelete });

    await user.click(screen.getByRole('button', { name: /delete/i }));

    expect(onDelete).toHaveBeenCalledWith('abc123');
  });

  it('links to the edit page for this task', () => {
    renderCard();
    expect(screen.getByRole('link', { name: /edit/i })).toHaveAttribute(
      'href',
      '/edit/abc123',
    );
  });

  it('has no grip when reordering is off, which is any filtered view', () => {
    renderCard({ sortable: false });
    expect(screen.queryByRole('button', { name: /reorder/i })).toBeNull();
  });

  it('has a grip you can tab to when reordering is on', () => {
    renderCard({ sortable: true });
    expect(
      screen.getByRole('button', { name: 'Reorder Book the dentist' }),
    ).toBeInTheDocument();
  });
});
