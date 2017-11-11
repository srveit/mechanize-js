'use strict';
const {newField} = require('./field');


exports.newKeygen = ({form, node}) => {
  const field = newField({form, node});
  let generatedKey = '',
    pem = '';
  const fieldType = () => 'keygen',
    challenge = () => field.nodeAttr('challenge'),
    key = () => generatedKey,
    value = () => pem;

  const generateKey = (keySize = 2049) => {
    // TODO: implement
    // Spec at http://dev.w3.org/html5/spec/Overview.html#the-keygen-element
    // generatedKey = OpenSSL::PKey::RSA.new(keySize);
    // @spki.public_key = generatedKey.public_key
    // @spki.sign(generatedKey, OpenSSL::Digest::MD5.new);
    // self.value = @spki.to_pem

    return {
      generatedKey,
      pem
    };
  };

  return Object.freeze({
    disabled: field.disabled,
    domId: field.domId,
    fieldType,
    name: field.name,
    nodeAttr: field.nodeAttr,
    queryValue: field.queryValue,
    value: field.value,
    challenge,
    key
  });
};
