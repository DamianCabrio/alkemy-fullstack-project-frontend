import { useState } from 'react';
import { FormRow, Alert, FormButton } from '../../components';
import { useAppContext } from '../../contexts/app/appContext';
import Wrapper from '../../styledWrappers/DashboardFormPage';

function Profile() {
  const {
    user,
    showAlert,
    displayAlert,
    clearAlert,
    updateUser,
    isLoading,
    updatePassword,
  } = useAppContext();

  const [name, setName] = useState(user?.name);
  const [surname, setSurname] = useState(user?.surname);
  const [email] = useState(user?.email);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmitProfile = (e) => {
    e.preventDefault();
    if (!name || !surname) {
      displayAlert(
        'Por favor llene todos los campos antes de enviar.',
        'danger'
      );
      return;
    }
    clearAlert();
    updateUser({ name, surname, email });
  };

  const handleSubmitPassword = (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      displayAlert(
        'Por favor llene todos los campos antes de enviar.',
        'danger'
      );
      return;
    }
    if (password !== confirmPassword) {
      displayAlert('Las contraseñas no coinciden.', 'danger');
      return;
    }
    clearAlert();
    updatePassword(password);
  };

  return (
    <Wrapper>
      <form className="form" onSubmit={handleSubmitProfile}>
        {showAlert && <Alert />}
        <h3>Perfil</h3>
        <div className="form-center">
          <FormRow
            labelText="Nombre"
            name="name"
            value={name}
            id="name"
            handleChange={(e) => setName(e.target.value)}
          />
          <FormRow
            labelText="Apellido"
            name="surname"
            value={surname}
            id="surname"
            handleChange={(e) => setSurname(e.target.value)}
          />
          <FormRow
            labelText="Email"
            name="email"
            type="email"
            value={email}
            id="email"
            disabled
          />
          <FormButton
            classes="btn-block"
            type="submit"
            labelText="Guardar Cambios"
            disabled={isLoading}
          />
        </div>
      </form>
      <form className="form" onSubmit={handleSubmitPassword}>
        <h4>Contraseña</h4>
        <div className="form-center">
          <FormRow
            labelText="Contraseña"
            name="password"
            type="password"
            value={password}
            id="password"
            handleChange={(e) => setPassword(e.target.value)}
          />
          <FormRow
            labelText="Confirmar Contraseña"
            name="confirmPassword"
            type="password"
            value={confirmPassword}
            id="confirmPassword"
            handleChange={(e) => setConfirmPassword(e.target.value)}
          />
          <FormButton
            classes="btn-block"
            labelText="Cambiar Contraseña"
            type="submit"
            disabled={isLoading}
          />
        </div>
      </form>
    </Wrapper>
  );
}
export default Profile;
