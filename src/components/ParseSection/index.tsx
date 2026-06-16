import { Button, Form, Input } from "antd";

import styles from "./index.module.scss";
import { useLocalStorageState } from "ahooks";

type ParseSectionProps = {
  onParse: (values: typeof defaultValues) => Promise<void>;
  loading?: boolean;
};

const defaultValues = {
  musicLink: "《一点》@汽水音乐 https://qishui.douyin.com/s/ia4MqU3p/",
};

const ParseSection = ({ loading = false, onParse }: ParseSectionProps) => {
  const [form] = Form.useForm<typeof defaultValues>();
  const [initValues] = useLocalStorageState("parse-section-values", {
    defaultValue: defaultValues,
  });

  const handleFinish = async () => {
    const values = await form.validateFields();
    await onParse(values);
  };

  return (
    <section
      className={`${styles["card"]} ${styles["search-card"]}`}
      aria-label="音乐链接解析">
      <Form
        className={styles["search-form"]}
        form={form}
        initialValues={initValues}
        onFinish={handleFinish}>
        <Form.Item
          className={styles["form-item"]}
          name="musicLink"
          rules={[{ required: true, message: "请输入音乐分享链接" }]}>
          <Input
            className={styles["music-input"]}
            prefix={
              <i
                className="ri-link-m"
                aria-hidden="true"
              />
            }
            placeholder="粘贴汽水音乐分享链接，支持带文案的完整分享内容"
            aria-label="音乐分享链接"
            allowClear
          />
        </Form.Item>
        <Button
          className={styles["primary-button"]}
          htmlType="submit"
          aria-label="解析音乐链接"
          loading={loading}>
          <i
            className="ri-search-line"
            aria-hidden="true"
          />
          解析
        </Button>
      </Form>
      <div
        className={styles["hint-row"]}
        aria-label="功能提示">
        <span className={styles["hint-chip"]}>
          <i
            className="ri-shield-check-line"
            aria-hidden="true"
          />
          本地历史记录
        </span>
        <span className={styles["hint-chip"]}>
          <i
            className="ri-smartphone-line"
            aria-hidden="true"
          />
          移动端适配
        </span>
        <span className={styles["hint-chip"]}>
          <i
            className="ri-download-cloud-2-line"
            aria-hidden="true"
          />
          单文件构建
        </span>
      </div>
    </section>
  );
};

export default ParseSection;
