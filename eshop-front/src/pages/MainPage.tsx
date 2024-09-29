import { News } from '../entities/News/News.tsx'
import { CartWidget, Orders } from '../entities/Order/Order.tsx'
import React, { useState, useEffect } from 'react';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  GlobalOutlined,
  ProductOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  ProductFilled,
  ContactsOutlined
} from '@ant-design/icons';
import { Button, Layout, Menu, Typography, Flex, Input, Select, } from 'antd';
import { Products } from '../entities/Product/Product.tsx';
import { useNavigate } from 'react-router-dom';
import { OrderItemRequest } from '../entities/Order/Order.ts';
import { YMaps, Map, Placemark } from '@pbe/react-yandex-maps';


export const Calc: React.FC = () => {
  const [inputValue, setInputValue] = useState<string>('');
    const [fromBase, setFromBase] = useState<number>(10); // Система счисления исходного числа
    const [toBase, setToBase] = useState<number>(2); // Система счисления для результата
    const [result, setResult] = useState<string>('');

    const handleConvert = () => {
        try {
            const decimalValue = parseInt(inputValue, fromBase); // Перевод в десятичную систему
            if (isNaN(decimalValue)) {
                setResult('Invalid input');
            } else {
                const convertedValue = decimalValue.toString(toBase); // Перевод в целевую систему
                setResult(convertedValue);
            }
        } catch (error) {
            setResult('Error in conversion');
        }
    };

    return (
        <div>
            <Typography.Title>Number Base Converter</Typography.Title>
            
            <Input 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={`Enter a number in base ${fromBase}`}
                style={{ marginBottom: '1em' }}
            />
            
            <div style={{ marginBottom: '1em' }}>
                <span>From Base: </span>
                <Select defaultValue={10} style={{ width: 100, marginRight: '1em' }} onChange={(value) => setFromBase(value)}>
                    <Select.Option value={2}>Binary (2)</Select.Option>
                    <Select.Option value={8}>Octal (8)</Select.Option>
                    <Select.Option value={10}>Decimal (10)</Select.Option>
                    <Select.Option value={16}>Hexadecimal (16)</Select.Option>
                </Select>

                <span>To Base: </span>
                <Select defaultValue={2} style={{ width: 100 }} onChange={(value) => setToBase(value)}>
                    <Select.Option value={2}>Binary (2)</Select.Option>
                    <Select.Option value={8}>Octal (8)</Select.Option>
                    <Select.Option value={10}>Decimal (10)</Select.Option>
                    <Select.Option value={16}>Hexadecimal (16)</Select.Option>
                </Select>
            </div>

            <Button type="primary" onClick={handleConvert}>Convert</Button>

            {result && (
                <div style={{ marginTop: '1em' }}>
                    <Typography.Title level={5}>Result: {result}</Typography.Title>
                </div>
            )}
        </div>
    );
}


export const Contacts: React.FC = () => {

  return (
    <Flex vertical style={{padding: '2em'}}>
      <Typography.Title level={5}>Телефон: +79999999999</Typography.Title>
      <Typography.Title level={5}>Адрес: г.Москва, ул. Пушкина, д. Колотушкина</Typography.Title>
      
    <YMaps>
      <Map
        defaultState={{
        center: [55.684758, 37.738521],
        zoom: 15,
        }}
        >
        <Placemark geometry={[55.684758, 37.738521]} />
      </Map>
    </YMaps>
    <Calc/>
    </Flex>
  );
}


export const MainPage: React.FC = () =>
{
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);
    const [selWidget, setSelWidget] = useState('news');
    const [cart, setCart] = useState<OrderItemRequest[]>([]); // State for the cart
    const [currentTime, setCurrentTime] = useState<string>(new Date().toLocaleTimeString());
    const [currentDate, setCurrentDate] = useState<string>(new Date().toLocaleDateString());

    useEffect(() => {
      const timer = setInterval(() => {
        setCurrentTime(new Date().toLocaleTimeString());
        setCurrentDate(new Date().toLocaleDateString("en", {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }));
      }, 1000); // Обновляем время каждую секунду

      return () => clearInterval(timer); // Очищаем интервал при размонтировании компонента
    }, []);

    const cleanCart = () => {
      setCart([]);
    };
    const addToCart = (item: OrderItemRequest) => {
        setCart((prevCart) => {
            const existingItem = prevCart.find((cartItem) => cartItem.product.id === item.product.id);
            if (existingItem) {
                return prevCart.map((cartItem) =>
                    cartItem.product.id === item.product.id
                        ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
                        : cartItem
                );
            }
            return [...prevCart, item];
        });
    };
    const increaseQuantity = (productId: number) => {
      setCart((prevCart) =>
          prevCart.map((item) =>
              item.product.id === productId
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
          )
      );  
  };

  const decreaseQuantity = (productId: number) => {
      setCart((prevCart) =>
          prevCart.map((item) =>
              item.product.id === productId
                  ? { ...item, quantity: item.quantity > 1 ? item.quantity - 1 : 1 }
                  : item
          )
      );
  };

  const removeFromCart = (productId: number) => {
      setCart((prevCart) => prevCart.filter(item => item.product.id !== productId));
  };

    return (
        <Layout style={{minHeight: '100vh'}}>
          <Layout.Sider trigger={null} collapsible collapsed={collapsed} breakpoint='md'>
            <Menu
              theme="dark"
              mode="inline"
              defaultSelectedKeys={['news']}
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
                { key: 'cart', icon: <ShoppingCartOutlined />, label: 'Cart' },
                { key: 'contacts', icon: <ContactsOutlined />, label: 'Contacts' },
              ]}
            />
          </Layout.Sider>
        <Layout>
        <Layout.Header style={{ padding: 0, backgroundColor: '#fff'}}>
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
          <Typography.Text style={{fontWeight: 'bold', margin: '1em'}}>
        {currentTime} {currentDate}
          </Typography.Text>
        </Layout.Header>
        <Layout.Content
          style={{
            margin: '1rem',
            padding: 0,
            overflow: 'auto',
          }}
        >
          {selWidget === 'news' && <News />}
          {selWidget === 'products' && <Products addToCart={addToCart} />}
          {selWidget === 'orders' && <Orders />}
          {selWidget === 'cart' && (
              <CartWidget
                  cart={cart}
                  increaseQuantity={increaseQuantity}
                  decreaseQuantity={decreaseQuantity}
                  removeFromCart={removeFromCart}
                  cleanCart={cleanCart}
              />
          )}
          {selWidget == 'contacts' && <Contacts/>}
        </Layout.Content>
      </Layout>
    </Layout>
    );
}