console.log("new_changes.js loaded", Typed);
document.addEventListener('DOMContentLoaded', function() {
  new Typed('#typed', {
    strings: ["Lucknow", "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata", "Surat", "Pune", "Jaipur"],
    typeSpeed: 60,
    backSpeed: 60,
    loop: true,
    loopCount: Infinity,
    showCursor: true,
    cursorChar: '|',
    autoInsertCss: true,
    backDelay: 2000,
  });
});