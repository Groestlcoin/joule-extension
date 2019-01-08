enum CryptoTypes {
  GENERATE_SALT = 'GENERATE_SALT',
  SET_PASSWORD = 'SET_PASSWORD',
  SET_TEST_CIPHER = 'SET_TEST_CIPHER',
  ENTER_PASSWORD = 'ENTER_PASSWORD',
  
  REQUEST_PASSWORD = 'REQUEST_PASSWORD',
  REQUEST_PASSWORD_SUCCESS = 'REQUEST_PASSWORD_SUCCESS',
  REQUEST_PASSWORD_FAILURE = 'REQUEST_PASSWORD_FAILURE',
  CANCEL_PASSWORD = 'CANCEL_PASSWORD',
  CHANGE_PASSWORD = 'CHANGE_PASSWORD',
  CHANGING_PASSWORD = 'CHANGING_PASSWORD',
  CANCEL_CHANGE_PASSWORD = 'CANCEL_CHANGE_PASSWORD',
  CHANGE_PASSWORD_SUCCESS = 'CHANGE_PASSWORD_SUCCESS',
  LOGOUT = 'LOGOUT',
  SET_SYNCED_CRYPTO_STATE = 'SET_SYNCED_CRYPTO_STATE',
}

export default CryptoTypes;
