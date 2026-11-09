import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Alert, Button, Card, Form, Input, Select, Typography } from 'antd';
import { authApi } from '../api/authApi';
import type { LoginRequest } from '../api/types';
import { useAuth } from '../auth/AuthContext';
import { useApi } from '../hooks/useApi';
import { ThemeToggle } from '../theme/ThemeToggle';

/** Only redirect back to paths inside this app (blocks `//other-site.com` tricks). */
const isSafePath = (path: unknown): path is string =>
  typeof path === 'string' && path.startsWith('/') && !/^\/[/\\]/.test(path);

export default function LoginPage() {
  const { status, expired, login } = useAuth();
  const location = useLocation();
  const domains = useApi(authApi.domains);
  const [error, setError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  if (status === 'signedIn') {
    const from = (location.state as { from?: string } | null)?.from;
    return <Navigate to={isSafePath(from) ? from : '/'} replace />;
  }

  const submit = async (values: LoginRequest) => {
    setSubmitting(true);
    setError(undefined);
    try {
      await login(values);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <ThemeToggle className="login-theme-toggle" />
      <Card className="login-card">
        <Typography.Title level={3}>Sign in to OneEngine</Typography.Title>

        {expired && !error && (
          <Alert type="warning" showIcon title="Your session has expired. Please sign in again." />
        )}
        {error && <Alert type="error" showIcon title={error} />}

        <Form<LoginRequest> layout="vertical" onFinish={submit} requiredMark={false}>
          <Form.Item
            name="domain"
            label="Domain"
            rules={[{ required: true, message: 'Select your domain' }]}
          >
            <Select
              placeholder="Select your domain"
              loading={domains.loading}
              options={(domains.data ?? []).map((d) => ({ label: d, value: d }))}
            />
          </Form.Item>
          <Form.Item
            name="username"
            label="User name"
            rules={[{ required: true, whitespace: true, message: 'Enter your user name' }]}
          >
            <Input autoComplete="username" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: 'Enter your password' }]}
          >
            <Input.Password autoComplete="current-password" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={submitting}>
            Sign in
          </Button>
        </Form>
      </Card>
    </div>
  );
}
