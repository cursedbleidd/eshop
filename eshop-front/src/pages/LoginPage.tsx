import React from 'react';
import type { FormProps } from 'antd';
import { Button, Form, Input, Flex } from 'antd';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

type FieldType = {
  email: string;
  password: string;
  name?: string;
};

export const LoginPage: React.FC = () => {
    const [isReg, setReg] = useState<boolean>(false);
    const navigate = useNavigate();
    const onFinish: FormProps<FieldType>['onFinish'] = (values) => {
        console.log('Success:', values);

        axios.post(`https://localhost:7078/api/User/${isReg ? 'register' : 'login'}`,
          isReg ? {
            email: values.email,
            passwordHash: values.password,
            name: values.name
        } : null, 
        !isReg ? { params: {
          email: values.email,
          password: values.password
      }} : undefined)
        .then(response =>{
          localStorage.setItem('token', response.data.token);
          navigate('/');
      });
    };
    const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };
    return (
      <Flex align="center" justify="center" vertical style={{minHeight: '100vh'}}>
          <Form
            name="basic"
            style={{ maxWidth: '70%' }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
          >
            <Form.Item<FieldType>
              label="Email"
              name="email"
              rules={[{ required: true, message: 'Please input your email!' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item<FieldType>
              label="Password"
              name="password"
              rules={[{ required: true, message: 'Please input your password!' }]}
            >
              <Input.Password />
            </Form.Item>

            {
                isReg ? <Form.Item<FieldType>
              label="Name"
              name="name"
              rules={[{ required: true, message: 'Please input your name!' }]}
              //wrapperCol={{ offset: 8, span: 16 }}
            >
              <Input />
            </Form.Item> : <></>
            }

            <Form.Item>
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
            </Form.Item>
          </Form>
          <Button type="link" onClick={()=>setReg(!isReg)}>
          { isReg ? "Got acc?" : "No acc?"}
          </Button>
        </Flex>
)};

export default LoginPage;