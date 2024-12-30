import { Badge, Modal, Button } from "antd";
import { LoadingOutlined, SafetyOutlined } from "@ant-design/icons";
import { currencyFormatter } from "../../utils/helpers";
import ReactPlayer from "react-player";

const SingleCourseJumbotron = ({
  course,
  showModal,
  setShowModal,
  preview,
  setPreview,
  loading,
  user,
  handlePaidEnrollment,
  handleFreeEnrollment,
  enrolled,
  setEnrolled,
}) => {
  const {
    name,
    description,
    instructor,
    updatedAt,
    lessons,
    price,
    paid,
    category,
  } = course;

  return (
    <div className="jumbotron bg-primary square">
      <div className="row">
        <div className="col-md-8">
          <h1 className="text-light font-weight-bold">{name}</h1>

          <p className="lead">
            {description && description.substring(0, 160)}...
          </p>

          <Badge
            count={category}
            style={{ backgroundColor: "#03a9f4" }}
            className="pb-4 mr-2"
          />

          <p>강사: {instructor.name}</p>

          <p>마지막 업데이트: {new Date(updatedAt).toLocaleDateString()}</p>

          <h4 className="text-light">
            {paid
              ? currencyFormatter({
                  amount: price,
                  currency: "krw",
                })
              : "무료"}
          </h4>
        </div>

        <div className="col-md-4">
          {lessons[0].video && lessons[0].video.Location ? (
            <div
              onClick={() => {
                setPreview(lessons[0].video.Location);
                setShowModal(!showModal);
              }}
            >
              <ReactPlayer
                className="react-player-div"
                url={lessons[0].video.Location}
                light={course.image ? course.image.Location : "/course.jpg"}
                width="100%"
                height="225px"
              />
            </div>
          ) : (
            <>
              <img
                src={course.image ? course.image.Location : "/course.jpg"}
                alt={name}
                className="img img-fluid"
              />
            </>
          )}

          {loading ? (
            <div className="d-flex justify-content-center">
              <LoadingOutlined className="h1 text-danger" />
            </div>
          ) : (
            <Button
              className="mb-3 mt-3"
              type="danger"
              block
              shape="round"
              icon={<SafetyOutlined />}
              size="large"
              disabled={loading}
              onClick={paid ? handlePaidEnrollment : handleFreeEnrollment}
            >
              {user ? (enrolled.status ? "강의로 이동하기" : "등록하기") : "등록하기 위해 로그인하기"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SingleCourseJumbotron;
