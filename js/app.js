// Ce fichier gère le menu mobile et la validation du formulaire de contact.
// Il est exécuté lorsque la page est chargée.
document.addEventListener("DOMContentLoaded", () => {
  // 1) GESTION DU MENU MOBILE
  const button = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".main-nav");

  if (button && nav) {
    button.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      button.setAttribute("aria-expanded", String(isOpen));
    });
  }

  // 2) VALIDATION DU FORMULAIRE DE CONTACT
  const form = document.querySelector("#contact-form");
  if (!form) return;

  // Règles pour chaque champ du formulaire
  const fields = {
    name: {
      test: value => value.trim().length >= 2,
      message: "Veuillez saisir votre nom."
    },
    email: {
      test: value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()),
      message: "Veuillez saisir une adresse email valide."
    },
    message: {
      test: value => value.trim().length >= 10,
      message: "Le message doit contenir au moins 10 caractères."
    }
  };

  // Vérifie un champ et affiche un message d'erreur s'il est invalide
  const validateField = (fieldId) => {
    const input = document.getElementById(fieldId);
    const error = document.getElementById(fieldId + "-error");
    const rule = fields[fieldId];

    if (!input || !error || !rule) return true;

    const isValid = rule.test(input.value);
    error.textContent = isValid ? "" : rule.message;
    input.removeAttribute("aria-invalid");

    if (!isValid) {
      input.setAttribute("aria-invalid", "true");
    }

    return isValid;
  };

  // Quand on soumet le formulaire
  form.addEventListener("submit", event => {
    event.preventDefault();

    let formIsValid = true;

    // Vérifie chaque champ un par un
    Object.keys(fields).forEach(fieldId => {
      const isValid = validateField(fieldId);
      if (!isValid) {
        formIsValid = false;
      }
    });

    const feedback = document.getElementById("form-feedback");
    if (!feedback) return;

    feedback.className = "form-feedback " + (formIsValid ? "success" : "fail");
    feedback.textContent = formIsValid
      ? "Merci ! Validation réussie. Dans cette version front-end, aucun message n'est réellement envoyé."
      : "Veuillez corriger les champs indiqués.";
  });
});