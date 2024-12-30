import { useContext, useState } from "react";
import { Context } from "../../context";
import { Button } from "antd";
import axios from "axios";
import {
  SettingOutlined,
  UserSwitchOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import UserRoute from "../../components/routes/UserRoute";

const BecomeInstructor = () => {
  const [loading, setLoading] = useState(false);
  const {
    state: { user },
  } = useContext(Context);

  const becomeInstructor = () => {
    setLoading(true);
    axios
      .post("/api/make-instructor")
      .then((res) => {
        window.location.href = res.data;
      })
      .catch((err) => {
        console.log(err.response.status);
        toast.error("stripe로 이동이 실패했습니다. 다시 시도해 주세요.");
        setLoading(false);
      });
  };

  return (
    <>
      <h1 className="jumbotron text-center square">선생님 되기</h1>

      <div className="container">
        <div className="row">
          <div className="col-md-6 offset-md-3 text-center">
            <div className="pt-4">
              <UserSwitchOutlined className="display-1 pb-3" />
              <br />
              <h2>강의를 개설하기 전에 지불 관련 정보를 설정하세요.</h2>
              <p className="lead text-warning">
                Eschool partners with stripe to transfer earning to your bank
                account
              </p>

              <Button
                className="mb-3"
                type="primary"
                block
                shape="round"
                icon={loading ? <LoadingOutlined /> : <SettingOutlined />}
                size="large"
                onClick={becomeInstructor}
                disabled={
                  (user && user.role && user.role.includes("Instructor")) ||
                  loading
                }
              >
                {loading ? "처리중..." : "지불 설정하기"}
              </Button>

              <p className="lead">
                등록절차를 완료하기 위해 stripe로 리다이랙트 됩니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BecomeInstructor;
