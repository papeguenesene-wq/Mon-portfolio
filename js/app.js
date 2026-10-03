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

  // Navigation des photos Starlink.
  document.querySelectorAll(".activity-carousel").forEach(carousel => {
    const track = carousel.querySelector(".activity-carousel-track");
    const slides = carousel.querySelectorAll(".activity-slide");
    const position = carousel.querySelector(".activity-carousel-position");

    if (!track || !position || slides.length === 0) return;

    let currentSlide = 0;

    const showSlide = (index) => {
      currentSlide = (index + slides.length) % slides.length;
      track.style.transform = `translateX(-${currentSlide * 100}%)`;
      position.textContent = `Photo ${currentSlide + 1} sur ${slides.length}`;

      slides.forEach((slide, slideIndex) => {
        slide.setAttribute("aria-hidden", String(slideIndex !== currentSlide));
      });
    };

    carousel.querySelectorAll("[data-carousel-step]").forEach(control => {
      control.addEventListener("click", () => {
        showSlide(currentSlide + Number(control.dataset.carouselStep));
      });
    });

    showSlide(currentSlide);
  });

  // Masque les photos absentes pour conserver le visuel de remplacement.
  document.querySelectorAll(".activity-image img").forEach(image => {
    const imageContainer = image.parentElement;
    const showLoadedImage = () => {
      imageContainer.classList.add("has-photo");
    };
    const hideUnavailableImage = () => {
      image.hidden = true;
    };

    image.addEventListener("load", showLoadedImage, { once: true });
    image.addEventListener("error", hideUnavailableImage, { once: true });
    if (image.complete) {
      if (image.naturalWidth === 0) {
        hideUnavailableImage();
      } else {
        showLoadedImage();
      }
    }
  });

  // 2) FILTRAGE DES ACTIVITÉS
  const filters = document.querySelectorAll("[data-filter]");
  const activityCards = document.querySelectorAll(".activity-card[data-category]");
  const activityResult = document.querySelector(".activity-result");

  if (filters.length && activityCards.length) {
    filters.forEach(filter => {
      filter.addEventListener("click", () => {
        const selectedCategory = filter.dataset.filter;
        let visibleCount = 0;

        filters.forEach(item => {
          const isSelected = item === filter;
          item.classList.toggle("active", isSelected);
          item.setAttribute("aria-pressed", String(isSelected));
        });

        activityCards.forEach(card => {
          const isVisible = selectedCategory === "all" || card.dataset.category === selectedCategory;
          card.hidden = !isVisible;
          if (isVisible) visibleCount += 1;
        });

        if (activityResult) {
          activityResult.textContent = `Affichage de ${visibleCount} intervention${visibleCount > 1 ? "s" : ""}`;
        }
      });
    });
  }

  // 3) VALIDATION DU FORMULAIRE DE CONTACT
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