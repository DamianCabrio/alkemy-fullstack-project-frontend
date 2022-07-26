import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { Logo, FormRow, Alert, FormButton } from '../components';
import { useAppContext } from '../contexts/app/appContext';
import Wrapper from '../styledWrappers/Register';

const initialState = {
  name: '',
  surname: '',
  email: '',
  password: '',
  confirmPassword: '',
  isLogin: true,
};

function Register() {
  const navigate = useNavigate();

  const [values, setValues] = useState(initialState);
  const { user, isLoading, showAlert, displayAlert, clearAlert, setupUser } =
    useAppContext();

  const toggleForms = () => {
    setValues({ ...values, isLogin: !values.isLogin });
    clearAlert();
  };

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    clearAlert();
    const { name, surname, email, password, isLogin, confirmPassword } = values;

    if (!email || !password || (!isLogin && (!name || !surname))) {
      displayAlert(
        'Por favor llene todos los campos antes de enviar.',
        'danger'
      );
      return;
    }

    if (password !== confirmPassword && !isLogin) {
      displayAlert('Las contraseñas no coinciden.', 'danger');
      return;
    }

    const userObj = { name, surname, email, password };

    if (isLogin) {
      delete userObj.name;
      delete userObj.surname;
      setupUser(userObj, 'login', '¡Bienvenido/a!');
    } else {
      setupUser(userObj, 'register', '¡Registro exitoso!');
    }
  };

  useEffect(() => {
    if (user) {
      setTimeout(() => {
        navigate('/dashboard');
        clearAlert();
      }, 500);
    }
  }, [user, navigate, clearAlert]);

  return (
    <Wrapper className="full-page">
      <form className="form" onSubmit={onSubmit}>
        <Logo />
        <h3>{values.isLogin ? 'Iniciar sesión' : 'Registrarse'}</h3>
        {showAlert && <Alert />}
        {!values.isLogin && (
          <FormRow
            labelText="Nombre"
            type="text"
            name="name"
            value={values.name}
            handleChange={handleChange}
          />
        )}
        {!values.isLogin && (
          <FormRow
            labelText="Apellido"
            type="text"
            name="surname"
            value={values.surname}
            handleChange={handleChange}
          />
        )}
        <FormRow
          type="email"
          name="email"
          value={values.email}
          handleChange={handleChange}
          labelText="Email"
        />
        <FormRow
          type="password"
          name="password"
          value={values.password}
          handleChange={handleChange}
          labelText="Contraseña"
        />
        {!values.isLogin && (
          <FormRow
            labelText="Confirmar contraseña"
            type="password"
            name="confirmPassword"
            value={values.confirmPassword}
            handleChange={handleChange}
          />
        )}
        <FormButton
          classes="btn-block"
          type="submit"
          labelText={values.isLogin ? 'Iniciar sesión' : 'Registrarse'}
          disabled={isLoading}
        />
        <p>
          {values.isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
          <button
            type="button"
            onClick={toggleForms}
            className="member-btn"
            disabled={isLoading}
          >
            {values.isLogin ? 'Registrarse' : 'Iniciar sesión'}
          </button>
        </p>
      </form>
    </Wrapper>
  );
}
export default Register;
