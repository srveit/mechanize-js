'use strict';
/**
 * Initialize a new `Keygen` with the given `node`.
 * If `initialValue` is undefined, uses the "value" attribute of `node`.
 *
 * @param {Element} node
 * @param {String} initialValue
 * @api public
 */
const {newField} = require('./field');

exports.newKeygen = (node, initialValue) => {
  const field = newField(node, initialValue);
  let generatedKey;
  const fieldType = 'keygen',
    challenge = field.getAttribute('challenge'),
    key = () => generatedKey,
    generateKey = (keySize = 2049) => {
      // TODO: implement
      // Spec at http://dev.w3.org/html5/spec/Overview.html#the-keygen-element
      // @spki = OpenSSL::Netscape::SPKI.new
      // @spki.challenge = @challenge
      // generatedKey = OpenSSL::PKey::RSA.new(keySize);
      // @spki.public_key = generatedKey.public_key
      // @spki.sign(generatedKey, OpenSSL::Digest::MD5.new);
      // self.value = @spki.to_pem

      // Note: I could not figure out how to do this with the Node.JS crypto lib
      // const spki = {
      //   spkac: {
      //     pubkey: {},
      //     challenge: ''
      //   },
      //   sig_algor: {},
      //   signature: ''
      // };
      // spki.spkac.challenge = challenge;
      // const RSA_F4 = 0x10001; // 65537
      // generatedKey = new RSA(keySize, RSA_F4);
      // spki.public_key = generatedKey;
      // generatedKey = '';
      const pem = '' + keySize;
      field.setValue(pem);
    };

  if (!initialValue) {
    generateKey();
  }

  return Object.freeze({
    challenge,
    disabled: field.disabled,
    domId: field.domId,
    fieldType,
    generateKey,
    getAttribute: field.getAttribute,
    key,
    name: field.name,
    queryValue: field.queryValue,
    rawValue: field.rawValue,
    setValue: field.setValue,
    type: field.type,
    value: field.value,
  });
};
