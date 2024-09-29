import { Button, Flex, Typography } from "antd";
import { HomeOutlined } from "@ant-design/icons"
import { useNavigate } from "react-router-dom";

export const ErrorPage: React.FC = () => {
    const navigate = useNavigate();
    return (
        <Flex align="center" justify="center" vertical>
            <Typography.Title>
                Error occured
            </Typography.Title>
            <Button type="link" icon={<HomeOutlined />} onClick={() => navigate("/")}>
            Go to home page
            </Button>
        </Flex>
    );
};