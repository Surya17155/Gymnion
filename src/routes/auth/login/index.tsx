import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/auth/login/')({
  beforeLoad: () => {
    //
  },
  component: () => null,
});
