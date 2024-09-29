import { NewsWidget } from '../entities/News/News.tsx'
import { UserWidget } from '../entities/User/User.tsx'
import React, { useState } from 'react';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  GlobalOutlined,
  ProductOutlined,
  UserOutlined,
  ProductFilled,
} from '@ant-design/icons';
import { Button, Layout, Menu } from 'antd';
import { ProductsWidget } from '../entities/Product/Product.tsx';
import { useNavigate } from 'react-router-dom';

export const AdminPage: React.FC = () =>
{
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);
    const [selWidget, setSelWidget] = useState('users');

    return (
        <Layout style={{minHeight: '100vh'}}>
          <Layout.Sider trigger={null} collapsible collapsed={collapsed} breakpoint='md'>
            <Menu
              theme="dark"
              mode="inline"
              defaultSelectedKeys={['users']}
              onSelect={(info) => setSelWidget(info.key)}
              items={[
                {
                  key: 'news',
                  icon: <GlobalOutlined />,
                  label: 'News',
                },
                {
                  key: 'products',
                  icon: <ProductOutlined />,
                  label: 'Products',
                },
                {
                  key: 'orders',
                  icon: <ProductFilled />,
                  label: 'Orders',
                },
                { key: 'users', icon: <UserOutlined />, label: 'Users' },
              ]}
            />
          </Layout.Sider>
        <Layout>
        <Layout.Header style={{ padding: 0, backgroundColor: '#fff' }}>
        <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{margin: '1em'}}
          />
          <Button
            type="text"
            icon={<UserOutlined/>}
            onClick={() => navigate('/login')}
            style={{margin: '1em'}}
          />
        </Layout.Header>
        <Layout.Content
          style={{
            margin: '1rem',
            padding: 0,

            overflow: 'auto',
          }}
        >
          {selWidget === 'news' && <NewsWidget />}
          {selWidget === 'products' && <ProductsWidget />}
          {selWidget === 'orders' && <UserWidget />}
          {selWidget === 'users' && (
              <UserWidget showUsers/>
          )}
        </Layout.Content>
      </Layout>
    </Layout>
    );
}