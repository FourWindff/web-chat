import React, {useState} from "react";
import styles from './AuthPage.module.css'

export default function AuthPage({onLogin}) {
    const [form, setForm] = useState({username: 'me', userid: ''});

    const handleChange = (e) => {
        const {name, value} = e.target;
        setForm((prevForm) => ({...prevForm, [name]: value}));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // 登录逻辑
        console.log("Login form submitted:", {
            username: form.username,
            id: form.userid,
        });
        onLogin(form.username, form.userid);
    };

    return (
        <div className={styles.authPageContainer}>
            <div className={styles.formOutSideContainer}>
                <h2>{"登录页面"}</h2>
                <form onSubmit={handleSubmit} className={styles.formContainer}>
                    <div className={styles.formItem}>
                        <label>用户名:</label>
                        <input
                            type="text"
                            name="username"
                            value={form.username}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className={styles.formItem}>
                        <label>ID:</label>
                        <input
                            type="text"
                            name="userid"
                            value={form.userid}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button type="submit">登录</button>
                </form>
            </div>
        </div>
    )
        ;
}
